export const mcpTools = [
    {
        name: "go_to_definition",
        description: "Navigates to the original definition of a symbol at a specified location in code. " +
            "This tool performs semantic analysis to find the true source definition, not just matching text. It can locate:\n" +
            "- Function/method declarations\n" +
            "- Class/interface definitions\n" +
            "- Variable declarations\n" +
            "- Type definitions\n" +
            "- Import/module declarations\n\n" +
            "The tool is essential for:\n" +
            "- Understanding where code elements are defined\n" +
            "- Navigating complex codebases\n" +
            "- Verifying the actual implementation of interfaces/abstractions\n\n" +
            "",
        inputSchema: {
            type: "object",
            properties: {
                textDocument: {
                    type: "object",
                    description: "The document containing the symbol",
                    properties: {
                        uri: {
                            type: "string",
                            description: "URI of the document"
                        }
                    },
                    required: ["uri"]
                },
                position: {
                    type: "object",
                    description: "The position of the symbol",
                    properties: {
                        line: {
                            type: "number",
                            description: "One-based line number"
                        },
                        character: {
                            type: "number",
                            description: "Zero-based character position"
                        }
                    },
                    required: ["line", "character"]
                }
            },
            required: ["textDocument", "position"]
        }
    },
    {
        name: "read_content",
        description: "Reads document content by URI. Supports reading the entire document or a specific line range. URI supports file:// and jdt:// protocols.",
        inputSchema: {
            type: "object",
            properties: {
                textDocument: {
                    type: "object",
                    description: "The document to read",
                    properties: {
                        uri: {
                            type: "string",
                            description: "URI of the document"
                        }
                    },
                    required: ["uri"]
                },
                range: {
                    type: "object",
                    description: "The range to read",
                    properties: {
                        startLine: {
                            type: "number",
                            description: "The starting line number (1-based)."
                        },
                        endLine: {
                            type: "number",
                            description: "The ending line number (inclusive, 1-based)."
                        }
                    },
                    required: ['startLine', 'endLine']
                }
            },
            required: ["textDocument", "range"]
        },
        
    },
    {
        name: "get_workspace_symbols",
        description: "Searches for symbols across the entire workspace. This is useful for finding symbols by name across all files. Especially useful for finding the file and positions of a symbol to use in other tools.",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query for finding symbols"
                }
            },
            required: ["query"]
        }
    }
];

export const toolsDescriptions = [
    {
        name: "go_to_definition",
        description: "Find definition of a symbol"
    },
    {
        name: "read_content",
        description: "Reads the content of a file"
    },
    {
        name: "get_workspace_symbols",
        description: "Searches for symbols across the entire workspace"
    }
];