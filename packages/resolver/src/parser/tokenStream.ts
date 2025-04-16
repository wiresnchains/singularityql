import { Token, TokenType, tokenTypeToString } from "./token";

export class TokenStream {
    private tokens: Token[];
    private position: number;
    
    public constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = -1;
    }

    public getCurrent(): Token {
        return this.tokens[this.position];
    }

    public advance(...expectedTokenTypes: TokenType[]): Token {
        let nextToken = this.peek();

        if (expectedTokenTypes.find((tokenType) => tokenType == nextToken.type) === undefined) {
            throw new Error(`Unexpected token ${tokenTypeToString(nextToken.type)} at ${nextToken.line}:${nextToken.position}`);
        }

        return this.advanceAny()!;
    }

    public advanceAny(): Token | undefined {
        if (!this.peek())
            return undefined;

        this.position++;
        return this.getCurrent();
    }

    public peek(): Token {
        const nextToken = this.tokens[this.position + 1];

        if (!nextToken) {
            let current = this.getCurrent();
            throw new Error(`Unexpected end of stream at ${current.line}:${current.position}`);
        }

        return nextToken;
    }

    public peekAny(): Token | undefined {
        return this.tokens[this.position + 1] || undefined;
    }
}
