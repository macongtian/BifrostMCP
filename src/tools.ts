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
                target_file: {
                    type: "string",
                    description: "The file containing the symbol",
                },
                position: {
                    type: "object",
                    description: "The position of the symbol",
                    properties: {
                        line: {
                            type: "number",
                            description: "Zero-based line number"
                        },
                        character: {
                            type: "number",
                            description: "Zero-based character position (column)"
                        }
                    },
                    required: ["line", "character"]
                }
            },
            required: ["target_file", "position"]
        }
    },
    {
        name: "get_symbol_definition",
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
    },
    {
        name: "get_type_definition",
        description: "Searches for type across the entire workspace. This is useful for finding type by name across all files. Especially useful for finding the file and positions of a type to use in other tools.",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the type to find"
                },
                container_name: {
                    type: "string",
                    description: "The name of the container to find. If not provided, the tool will search the entire workspace."
                }
            },
            required: ["name"]
        }
    },
    {
        name: "read_file_content",
        description: "Reads the contents of a file. This is useful for getting the contents of a file to use in other tools.",
        inputSchema: {
            type: "object",
            properties: {
                target_file: {
                    type: "string",
                    description: "The file path to read, can be relative to the current file or absolute or uri format"
                },
                should_read_entire_file: {
                    type: "boolean",
                    description: "Optional, default is false. If set to true, read the entire file, but usually only for small files or files explicitly specified by the user.",
                    required: false
                },
                start_line_one_indexed: {
                    type: "integer",
                    description: "Required when should_read_entire_file is false. Start reading from which line (line number starts from 1).",
                    required: false
                },
                end_line_one_indexed_inclusive: {
                    type: "integer",
                    description: "Required when should_read_entire_file is false. Read to which line (inclusive of this line).",
                    required: false
                }
            },
            required: ["target_file"]
        }
    }
];

export const toolsDescriptions = [
    {
        name: "go_to_definition",
        description: "Find definition of a symbol"
    },
    {
        name: "get_symbol_definition",
        description: "Finds all definitions for a given symbol name across the workspace."
    },
    {
        name: "read_file",
        description: "Reads a file from a relative/absolute path or a URI."
    }
];