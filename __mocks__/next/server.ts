
export class NextRequest {
    url: string;
    constructor(input: string, _init?: any) {
        this.url = input;
    }
}

// Mock muito simples do NextResponse.json
export class NextResponse {
    status: number;
    body: any;

    private constructor(body: any, init?: { status?: number }) {
        this.body = body;
        this.status = init?.status ?? 200;
    }

    static json(body: any, init?: { status?: number }) {
        // Imitamos a interface Response que o teu teste espera
        return {
            status: init?.status ?? 200,
            json: async () => body,
        } as any;
    }
}
