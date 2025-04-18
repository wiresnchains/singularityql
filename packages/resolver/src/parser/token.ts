export enum TokenType {
    Identifier,
    BraceLeft,
    BraceRight,
    ParenthesesLeft,
    ParenthesesRight,
    StringLiteral,
    NumberLiteral,
    Comma,
    Colon,
    QuestionMark,
    Tilde,
}

export type Token = {
    line: number;
    position: number;
    type: TokenType;
    value: string;
}

export function tokenTypeToString(tokenType: TokenType): string {
    switch (tokenType) {
        case TokenType.Identifier:
            return "Identifier";
        case TokenType.BraceLeft:
            return "BraceLeft";
        case TokenType.BraceRight:
            return "BraceRight";
        case TokenType.ParenthesesLeft:
            return "ParenthesesLeft";
        case TokenType.ParenthesesRight:
            return "ParenthesesRight";
        case TokenType.StringLiteral:
            return "StringLiteral";
        case TokenType.NumberLiteral:
            return "NumberLiteral";
        case TokenType.Comma:
            return "Comma";
        case TokenType.Colon:
            return "Colon";
        case TokenType.QuestionMark:
            return "QuestionMark";
        default:
            return "UnknownToken";
    }
}
