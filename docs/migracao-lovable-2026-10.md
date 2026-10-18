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

## Auditoria funcional detalhada (18/10/2026)

A auditoria foi conduzida no agente Lovable a partir do pacote histórico original extraído dos nove chunks em `/tmp/brilha-audit/original/dist/`. O pacote contém JavaScript legível e funcional, mas não fontes TypeScript originais. Arquivos examinados incluem `algorithm.js`, `session-policy.js`, `permissions.js`, `action-groups.js`, `connected-app.js`, `local-app.js`, `student-access.js`, `remote.js`. As conclusões abaixo não comprovam paridade do backend SQL.

### Comparações automatizadas locais

| Comparação | Cenários | Divergências |
|---|---:|---:|
| `computeReview` | 1.620 | 0 |
| `normalizeRolePermissions` | 32.768 | 0 |
| `selectDueSessionQueue` | 10 | 0 |

Intervalos mantidos: `[0,1,3,7,14,30,60,120,240]`; acerto avança um estágio; parcial mantém estágio com 40% do intervalo (mínimo 1 dia); erro retrocede dois; no estágio zero reaprendizagem em oito minutos; três falhas consecutivas acionam `intervention_required`. A seleção de estados vencidos prioriza reaprendizagem e limita normalmente a 12 itens.

### Divergências confirmadas — alta prioridade

1. **Proteção da área da professora:** original `connected-app.js/unlockTeacherArea` pede senha ao retornar do modo aluno; reconstrução `src/routes/equipe.tsx` permite retorno direto pelo botão. Restaurar bloqueio de acesso adulto, sem enfraquecer RLS.
2. **Gerenciamento de dispositivos e PIN:** reconstrução não disponibiliza `clear_student_access_pin`, `get_classroom_devices`, `revoke_classroom_device` nem `get_backend_status`; original tinha 28 RPCs e reconstrução usa 24.
3. **Gravação de permissões:** original passa mapa completo incluindo `false` a `p_permissions`; reconstrução `src/components/brilha/AdminPanels.tsx` envia somente a lista de permissões ativas. É necessário ler assinatura SQL antes de qualquer correção, pois a mudança pode impedir revogações.
4. **Preservação de metadados:** edição de conteúdo na reconstrução pode enviar nulos para `source_url` e `rights_note`. Necessária validação para impedir perda de fonte/licenciamento.
5. **Sessão de revisão:** em `src/routes/equipe.tsx/ClassroomSession`, uma resposta muito rápida pode enviar `p_session_id: null` antes da inserção da sessão. Confirmar com teste.
6. **Conclusão em casa:** `src/routes/casa.tsx` ignora determinados erros de finalização e alguns ramos deixam token de sessão residual.

### Diferenças adicionais

- Apresentação local: original zera `consecutiveFailures` e registra `adultVerifiedAt`; reconstrução preserva falhas e não reproduz essa marcação.
- Priorização de grupos: original ordena por `kind:objectiveId`, reconstrução por número de alunos. A manutenção de intervenções abertas foi confirmada como equivalente no sentido de não duplicar apresentações.
- O link de casa original usa caminhos e parâmetros diferentes (`?equipe=1` e `ativar` no caminho corrente); a reconstrução gera `/casa?ativar=...`. Necessário teste de compatibilidade de links antigos.
- O lembrete do aluno da reconstrução admite `/demo?aluno=...` como acesso lembrável sem PIN; o achado envolve somente demonstração, não acesso real.
- Bibliotecas: filtros, miniaturas e prévias presentes no original não estão todos na reconstrução.
- Designação: original pode enviar `p_student_ids: null` para uma turma inteira; reconstrução envia IDs específicos, sem contagens anteriores; datas usam UTC em alguns pontos.
- Histórico pedagógico/coordenação: original consulta `review_events`, `human_introductions`, `teacher_verifications`, evolução 7/30/90 dias; reconstrução prioriza o estado atual.
- Modo local: criação personalizada de conceitos/cards e histórico detalhado ainda não reproduzidos; o histórico é truncado para 500 eventos.
- PWA original tinha service worker; reconstrução usa manifest e ícones, sem service worker.
- OAuth Google não existe no original; no Lovable foi adicionado `signInWithOAuth`, mas o provedor externo ainda não foi validado.

### Portões de aceitação antes do merge

1. Auditar SQL das RPCs e políticas RLS por perfil, turma e unidade; usar ambiente de teste, jamais contas reais de crianças.
2. Restaurar proteção de retorno à área adulta, remoção de PIN, gestão/revogação de dispositivos e transparência de erros.
3. Corrigir gravação de permissões conforme contrato SQL e confirmar revogações/negações em testes.
4. Garantir preservação de fontes e direitos ao editar conteúdo; testar revisão/publicação sem regressão de permissões.
5. Corrigir ciclo de sessão, datas locais de designação e compatibilidade de URLs antigas.
6. Reproduzir ou aprovar conscientemente as lacunas de histórico, coordenação, filtros e modo local.
7. Rodar testes fim a fim de login, PIN, ativação, sessões, revisão, demonstração, PWA, navegação e backend no novo domínio; somente então avaliar o merge.

**Nenhuma dessas divergências prova perda efetiva de dados; nenhum merge ou deploy foi realizado nesta auditoria.**


## Verificação após as correções da reconstrução (18/10/2026, 14h47–15h)

**Origem do código verificado:** `guicoebr/brilha-memoria-3a9c8c9a` commit `75974d50bc23f1cc72b1e0772b6b15aed7e78bfa` (este commit já estava no GitHub). O trabalho segue separado do original.

### Correções confirmadas na leitura do código

- `src/routes/equipe.tsx` usa bloqueio persistente para o retorno à UI adulta, que apresenta `StaffUnlock`; o seletor visual para simular administração foi removido.
- `src/components/brilha/StaffUnlock.tsx` usa um cliente Supabase temporário sem persistir sessão para autenticar novamente por senha e compara o ID do usuário resultante com o da sessão adulta. **Contas Google/OAuth continuam sem caminho de desbloqueio**. O bloqueio local impede acesso casual à interface, mas não constitui isolamento criptográfico da sessão da equipe: a sessão autenticada permanece no navegador. Avaliar isolamento forte do aparelho antes de uso irrestrito por crianças.
- `src/lib/brilha/safety.ts`: `permissionPayload` converte as linhas para JSON OBJECT com booleanos normalizados, incluindo `false`; `AdminPanels.tsx` envia esse objeto ao `set_role_permissions`.
- O editor `AdminPanels.tsx` lê `source_url` e `rights_note` junto das mídias e os envia de volta. O SQL real de `update_content_bundle` aceita edição de um conteúdo já publicado por `content.edit` sem exigir nova permissão de publicação, desde que o status continue publicado.
- `equipe.tsx` aguarda o UUID de sessão, usa trava de submissão para evitar duplo envio; `casa.tsx` retém o token e permite tentar novamente quando `device_finish_student_session` falha.
- `safety.test.js` define nove testes unitários; o Lovable relata aprovação, além de testes de navegador com respostas simuladas. **Esses testes não exercitaram escrita real no Supabase.**

### Contratos externos confirmados por consulta SQL SOMENTE LEITURA

- O projeto Supabase externo `nvmaiytcawbsqlejbdai` estava `ACTIVE_HEALTHY` nesta verificação.
- `set_role_permissions(p_role app_role, p_permissions jsonb)` exige `jsonb_typeof(p_permissions) = 'object'`; faz upsert para cada chave configurável presente, inclusive `false`; requer administrador.
- `clear_student_access_pin(p_student_id uuid)`: exige perfil, `session.run` e `can_access_student`.
- `get_classroom_devices(p_class_id uuid)`: retorna `device_id`, `bound_student_id`, `status`, entre outros; exige `session.run` e `can_access_class`.
- `revoke_classroom_device(p_device_id uuid)`: exige perfil, `session.run` e `can_access_class`; marca dispositivo como revogado e revoga sessões de estudantes abertas para esse aparelho.
- `can_access_class` exige `class.view` e autorização da turma; `can_access_student` exige `student.view` e matrícula vigente em turma autorizada.
- `update_content_bundle`: exige `content.edit`, requer `content.publish` para transição de rascunho a publicado e atualiza metadados existentes. A UI agora envia fontes/direitos não nulos quando eles existem.

### Portões ainda abertos

1. Não há reautenticação segura para retorno de usuários que entraram por Google: fluxo bloqueado deliberadamente, pendente de projeto e teste.
2. Sem testes reais com perfis isolados, PIN de teste, escrita/revogação, e sem revisão integral de políticas RLS. Consultar contratos de funções não substitui esses testes.
3. Nenhuma execução manual de `SPA_BUILD=1` confirmou o build após as últimas mudanças; o Lovable reportou typecheck e build automático, mas não o build estático independente.
4. O workflow `.github/workflows/deploy-hostgator.yml` está configurado para acionar com `push` em `main`; confirmar ausência de credenciais FTP de produção e bloquear deploy automático até aprovação final da migração.
5. Nenhum merge no original, alteração de DNS, ou publicação no HostGator está autorizado.
