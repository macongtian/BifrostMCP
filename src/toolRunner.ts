import * as vscode from 'vscode';
import { createVscodePosition, getPreview, asyncMap } from './helpers';
import { mcpTools } from './tools';

const toolNames = mcpTools.map((tool) => tool.name);



export const runTool = async (name: string, args: any) => {
    let result: any;
    if (!toolNames.includes(name)) {
        throw new Error(`Unknown tool: ${name}`);
    }
    let uri = vscode.Uri.parse(args?.textDocument?.uri ?? '');

    switch (name) {

        case "go_to_definition":
            result = await handleGoToDefinition(uri, args);
            break;
        case "read_content":
            result = await handleReadContent(uri, args);
            break;
        case "get_workspace_symbols":
            result = await findSymbol(args);
            break;
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
    return result;
};



async function handleGoToDefinition(uri: vscode.Uri, args: any) {
    try {
        await vscode.workspace.fs.stat(uri);
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `Error: File not found - ${uri.fsPath}`
            }],
            isError: true
        };
    }
    const position = args?.position ? createVscodePosition(
        args.position.line,
        args.position.character
    ) : undefined;
    const commandResult = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider',
        uri,
        position
    );
    return await asyncMap(commandResult, async (def: vscode.Location) => ({
        uri: def.uri.toString(),
        range: {
            start: {
                line: def.range.start.line + 1,
                character: def.range.start.character
            },
            end: {
                line: def.range.end.line + 1,
                character: def.range.end.character
            }
        },
        preview: await getPreview(def.uri, def.range?.start.line)
    }));
}

async function handleReadContent(uri: vscode.Uri, args: any) {
    const startLine = (args?.range?.startLine ?? 1) - 1;
    const endLine = (args?.range?.endLine ?? startLine + 1) - 1;
    if (startLine > endLine) {
        return {
            file_content: '',
            summary_of_other_lines: 'Start line is greater than end line'
        };
    }
    const document = await vscode.workspace.openTextDocument(uri);
    const selectedLines = document.getText(new vscode.Range(startLine, 0, endLine, Number.MAX_VALUE));
    let summary = '';
    if (startLine > 0) {
        summary += `Lines 1-${startLine} not shown. `;
    }
    if (endLine < document.lineCount - 1) {
        summary += `Lines ${endLine + 2}-${document.lineCount} not shown.`;
    }
    return {
        file_content: selectedLines,
        summary_of_other_lines: summary.trim()
    };
}

async function findSymbol(args: any) {
    const query = args.query || '';
    const symbols = await vscode.commands.executeCommand<vscode.SymbolInformation[]>(
        'vscode.executeWorkspaceSymbolProvider',
        query
    );
    return symbols?.map(symbol => ({
        name: symbol.name,
        kind: symbol.kind,
        location: {
            uri: symbol.location.uri.toString(),
            range: {
                start: {
                    line: symbol.location.range.start.line,
                    character: symbol.location.range.start.character
                },
                end: {
                    line: symbol.location.range.end.line,
                    character: symbol.location.range.end.character
                }
            }
        },
        containerName: symbol.containerName
    }));
}


