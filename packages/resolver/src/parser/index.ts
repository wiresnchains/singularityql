import { tokenize } from "./lexer";
import { Query, QueryDataRequest, QueryParam, QueryParamType } from "./query";
import { TokenType } from "./token";
import { TokenStream } from "./tokenStream";

export function parse(query: string): Query[] {
    const queries: Query[] = [];
    const tokenStream = new TokenStream(tokenize(query));

    while (true) {
        queries.push(parseQuery(tokenStream));

        if (!tokenStream.peekAny())
            break;
    }

    return queries;
}

function parseQuery(stream: TokenStream): Query {
    const resolverNameToken = stream.advance(TokenType.Identifier);

    const params = parseParams(stream);
    const requestedData = parseRequestedData(stream);
    const alias = parseAlias(stream);

    return {
        resolverName: resolverNameToken.value,
        params,
        requestedData,
        alias
    };
}

function parseParams(stream: TokenStream): QueryParam[] {
    let params: QueryParam[] = [];

    stream.advance(TokenType.ParenthesesLeft);

    if (stream.peek().type != TokenType.ParenthesesRight) {
        while (true) {
            let paramType: QueryParamType | undefined;
            let token = stream.advance(TokenType.Identifier, TokenType.StringLiteral, TokenType.NumberLiteral, TokenType.Colon);

            if (token.type == TokenType.Colon) {
                paramType = QueryParamType.Placeholder;
                token = stream.advance(TokenType.Identifier);
            }
            else {
                switch (token.type) {
                    case TokenType.Identifier:
                        paramType = QueryParamType.QueryVariable;
                        break;
                    case TokenType.StringLiteral:
                        paramType = QueryParamType.StringLiteral;
                        break;
                    case TokenType.NumberLiteral:
                        paramType = QueryParamType.NumberLiteral;
                        break;
                }
            }

            if (paramType == undefined) {
                throw new Error(`Failed to parse parameter type at ${token.line}:${token.position}`);
            }

            params.push({
                type: paramType,
                value: token.value
            });

            if (stream.peek().type !== TokenType.Comma)
                break;

            stream.advance(TokenType.Comma);
        }
    }

    stream.advance(TokenType.ParenthesesRight);

    return params;
}

function parseRequestedData(stream: TokenStream): QueryDataRequest[] {
    const requestedData: QueryDataRequest[] = [];

    stream.advance(TokenType.BraceLeft);
    
    if (stream.peek().type != TokenType.BraceRight) {
        while (true) {
            const token = stream.advance(TokenType.Identifier);
            const alias = parseAlias(stream);
            
            requestedData.push({
                value: token.value,
                alias
            });

            if (stream.peek().type !== TokenType.Comma)
                break;

            stream.advance(TokenType.Comma);
        }
    }

    stream.advance(TokenType.BraceRight);

    return requestedData;
}

function parseAlias(stream: TokenStream): string | undefined {
    let next = stream.peekAny();

    if (!next || next.type != TokenType.Identifier || next.value != "as") {
        return; 
    }

    stream.advance(TokenType.Identifier);
    return stream.advance(TokenType.Identifier).value;
}
