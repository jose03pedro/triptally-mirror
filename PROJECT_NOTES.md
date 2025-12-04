Paginas:
/login
/trips
/profile
/trips/{tripId}

nao entendo ssr vs csr

metade do codigo nem sei porque existe

nao sei quais apis calls existem

nao sei onde estao os componentes principais

#TODO

- perceber NextRequest, NextResponse e connectionToDB
- hooks e states
- -usestate e -useeffect
- perceber o que é JSX
- perceber o que é TSX
- perceber o que é typescript
- perceber o que é interface
- perceber o que é async/await
- perceber o que é mongoose
- perceber o que é Trip model
- export async function __TYPE__ (o que significa)
- searchParams?
- perceber a diferenca entre app e lib
- perceber a diferenca entre models e components
- layout.tsx
- variavel let
- ...(query.)
  

  - o que mostra o frontend e backend 
  - o que e um modal
  - zod?
  - perceber o que é um schema
  - \
  

US209 - As an Authenticated User, I want to save trips created by other users, so that I can revisit them later.

```
Um utilizador autenticado pode carregar num botão “Save” numa trip pública.

Essa trip fica guardada na sua lista pessoal (“Saved Trips”).

Se já estiver guardada, o botão muda para “Unsave”.

O user pode ver a lista de trips guardadas (não vamos implementar o UI dessa lista agora — mas deixamos preparado no backend).
```

##TODO

-criar botao save que guarda/apaga(toggle button) trips numa lista pessoal de cada user

- disponibilizar lista para o user ver (guardar na db maybe??)