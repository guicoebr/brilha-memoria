# Reconciliação do Brilha Memória — original e reconstrução Lovable

> Estado: auditoria. NÃO autorizado a substituir a versão original nem a publicar em produção.

## Fontes (versões congeladas)

- **Original canônico:** `guicoebr/brilha-memoria`, `main` em `61c1c44e3896eca498526e5b5ac7333ae4b20246` (v0.3.20, 14/09/2026).
- **Reconstrução React/Lovable:** projeto `04df6231-29cd-4d83-bdad-d499dc48b139`, sincronizado no repositório separado `guicoebr/brilha-memoria-3a9c8c9a`, em `53ac49d7d9f24c09683a237bd482a7c178aaf7ac` (18/10/2026).
- **Banco de dados existente:** Supabase `nvmaiytcawbsqlejbdai`. Não recriar nem migrar dados.

## Fatos técnicos verificados

1. No original, o `package.json` versão 0.3.20 executa `node build.mjs`. O `build.mjs` lê os nove arquivos `deploy/chunk-00.txt` até `deploy/chunk-08.txt`, decodifica um tar.gz, extrai para `public/` e injeta `brilha-home-memory.js` nos HTMLs. O `vercel.json` configura rewrite de `/casa` para `/index.html`.
2. Na reconstrução, as regras foram reescritas com React, TypeScript e TanStack; exemplos: `src/lib/brilha/algorithm.ts`, `student-access.ts`, `permissions.ts`, `src/routes/casa.tsx` e `src/routes/equipe.tsx`.
3. `src/lib/brilha/supabase.ts` da reconstrução aponta para o projeto Supabase original. O fluxo de login da equipe é por e-mail/senha, com botão Google ainda dependente de configurar o provedor no backend externo; o acesso da criança utiliza vínculo de dispositivo e PIN.
4. A reconstrução já contém o workflow `.github/workflows/deploy-hostgator.yml`, modo `SPA_BUILD=1`, `public/.htaccess` e ícones PWA. **Não executar o deploy antes de configurar e conferir o destino FTPS.**

## Pontos que ainda exigem comparação e testes

- [ ] Recuperar o conteúdo expandido do pacote histórico dos nove chunks e identificar se traz fontes editáveis ou somente artefatos.
- [ ] Comparar algoritmo de repetição: estágios, intervalo, transições, critérios de sucesso/fracasso e intervenções.
- [ ] Comparar identificação por link, vínculo do aparelho, PIN, sessão e não persistência de dados sensíveis.
- [ ] Comparar permissões administrativas e medidas de segurança: RLS e RPCs.
- [ ] Comparar funcionalidades: conteúdos, imagens, designações, turmas, alunos, convites e relatórios.
- [ ] Testar navegação por URL direta, login da equipe, fluxo do aluno, modo demonstração, PWA e operação com Supabase real em ambiente isolado.
- [ ] Registrar as diferenças aprovadas e obter autorização antes do merge na `main` e antes de publicar.

## Política de segurança

- A branch `migration/lovable-react-2026-10` fica separada de `main` e preserva o histórico original.
- Não dar `force push` em `main`, não mesclar versões inteiras sem auditoria, não alterar DNS/FTP/produção.
- Manter o projeto Lovable sincronizado com `guicoebr/brilha-memoria-3a9c8c9a` durante o trabalho de reconciliação.
