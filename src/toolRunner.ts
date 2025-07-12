import * as vscode from 'vscode';
import * as path from 'path';
import { createVscodePosition, getPreview, asyncMap, createVscodeUri } from './helpers';
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
        case "read_file":
            result = await handleReadFile(args);
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


async function handleReadFile(args: any) {
    const targetFile = args.target_file;
    if (!targetFile) {
        return { 
            error: "target_file is required",
            isError: true 
        };
    }

    let fileUri = await createVscodeUri(targetFile);

    const document = await vscode.workspace.openTextDocument(fileUri);
    const totalLines = document.lineCount;

    if (args.should_read_entire_file) {
        return {
            file_path: fileUri.fsPath,
            content: document.getText(),
            start_line: 1,
            end_line: totalLines,
            total_lines: totalLines,
            summary: {
                lines_before: 'The file is not truncated at the beginning.',
                lines_after: 'The file is not truncated at the end.'
            }
        };
    }

    const startLineOneBased = args?.start_line_one_indexed ?? 1;
    const startLineZeroBased = startLineOneBased - 1;
    
    // 如果未提供结束行，则默认读取200行
    const endLineOneBased = args?.end_line_one_indexed_inclusive ?? (startLineOneBased + 199);
    const endLineZeroBased = endLineOneBased - 1;

    if (startLineZeroBased >= totalLines) {
        return {
            error: `Start line (${startLineOneBased}) exceeds total lines (${totalLines}).`,
            isError: true,
        };
    }

    const clampedStartLine = Math.max(0, startLineZeroBased);
    const clampedEndLine = Math.min(endLineZeroBased, totalLines - 1);

    if (clampedStartLine > clampedEndLine) {
        return {
            error: `Start line (${startLineOneBased}) is greater than end line (${endLineOneBased}).`,
            isError: true,
        };
    }

    const selectedLines = document.getText(new vscode.Range(clampedStartLine, 0, clampedEndLine, Number.MAX_VALUE));
    
    const linesBeforeSummary = clampedStartLine > 0
        ? `There are ${clampedStartLine} lines at the beginning that are not displayed.`
        : 'The file is not truncated at the beginning.';

    const linesAfterCount = totalLines - (clampedEndLine + 1);
    const linesAfterSummary = linesAfterCount > 0
        ? `There are ${linesAfterCount} lines at the end that are not displayed.`
        : 'The file is not truncated at the end.';

    return {
        file_path: fileUri.toString(),
        content: selectedLines,
        start_line: clampedStartLine + 1,
        end_line: clampedEndLine + 1,
        total_lines: totalLines,
        summary: {
            lines_before: linesBeforeSummary,
            lines_after: linesAfterSummary
        }
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


