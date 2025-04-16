import { Token, TokenType } from "./token";

export function tokenize(query: string): Token[] {
    const tokens: Token[] = [];

    let line = 1;
    let position = 0;
    let buffer = "";
    let inString = false;

    const pushToken = (type: TokenType, value: string) => {
        if (value.length < 1) {
            return;
        }

        tokens.push({ line, position, type, value });
        position += value.length;
    };

    const pushBuffer = () => {
        if (buffer.length < 1)
            return;

        if (/^[0-9]+(\.[0-9]+)?$/.test(buffer)) {
            pushToken(TokenType.NumberLiteral, buffer);
        }
        else {
            pushToken(TokenType.Identifier, buffer);
        }
        
        buffer = "";
    };

    for (let i = 0; i < query.length; i++) {
        const currentChar = query[i];

        if (!inString) {
            if (currentChar == '\n') {
                pushBuffer();
                line++;
                position = 0;
                continue;
            }
    
            if (currentChar == ' ' || currentChar == '\t' || currentChar == '\r') {
                pushBuffer();
                position++;
                continue;
            }

            switch (currentChar) {
                case '{':
                    pushBuffer();
                    pushToken(TokenType.BraceLeft, '{');
                    continue;
                case '}':
                    pushBuffer();
                    pushToken(TokenType.BraceRight, '}');
                    continue;
                case '(':
                    pushBuffer();
                    pushToken(TokenType.ParenthesesLeft, '(');
                    continue;
                case ')':
                    pushBuffer();
                    pushToken(TokenType.ParenthesesRight, ')');
                    continue;
                case ',':
                    pushBuffer();
                    pushToken(TokenType.Comma, ',');
                    continue;
                case ':':
                    pushBuffer();
                    pushToken(TokenType.Colon, ':');
                    continue;
                case '"':
                    pushBuffer();
                    inString = true;
                    position++;
                    continue;
            }
        }
        else if (currentChar == '"') {
            pushToken(TokenType.StringLiteral, buffer);
            buffer = "";
            inString = false;
            position++;
            continue;
        }

        buffer += currentChar;
    }

    pushBuffer();

    return tokens;
}
