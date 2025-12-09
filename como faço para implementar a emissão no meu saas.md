<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# como faço para implementar a emissão no meu saas

Você implementa a emissão no seu SaaS integrando o backend com a **API de Contribuintes (SEFIN Nacional)** em Produção Restrita primeiro, montando e enviando uma **DPS via `POST /nfse`** e tratando o retorno da NFS-e gerada. Depois de validar tudo nesse ambiente de testes, você aponta os mesmos fluxos para as URLs de Produção listadas na página de APIs do gov.br.[^1][^2][^3][^4][^5]

## Visão geral do fluxo

A API nacional trabalha basicamente assim: você monta uma **DPS (Documento de Prestação de Serviço)** com os dados do prestador, tomador, serviço e tributos, envia para o endpoint de NFS-e, e em modo síncrono já recebe a **NFS-e gerada ou uma rejeição com lista de erros**. Depois disso, você pode consultar a nota pela **chave de acesso (50 posições)** e gerar o **DANFSe em PDF** via a API específica de DANFSe.[^6][^7][^1]

## Pré-requisitos (negócio e técnicos)

- Verificar se os municípios da sua base já aderiram ao padrão nacional, pois só nesses casos a emissão via SEFIN Nacional funciona para o contribuinte.[^8][^9]
- Garantir que cada cliente do seu SaaS (empresa emissora) tenha **CNPJ habilitado, inscrição municipal e certificado digital ICP-Brasil (A1 ou A3)**, pois a API usa autenticação forte (mTLS) baseada em certificado para os contribuintes.[^10][^11][^1]
- Baixar o **“Manual Contribuintes Emissor Público API – Sistema Nacional NFS-e v1.2”**, que explica autenticação, layouts da DPS/NFS-e e todos os endpoints da SEFIN Nacional.[^12][^13][^1]


## Passo a passo de integração com a API Nacional

1. **Configurar ambientes e certificados**
    - No backend do seu SaaS, configurar dois conjuntos de URLs: Produção Restrita (teste) e Produção, usando a tabela da página que você mandou (ADN, CNC, Parâmetros Municipais, DANFSe e SEFIN).[^4][^5]
    - Configurar o cliente HTTP (Node/TS, Python etc.) para fazer **requisições HTTPS com certificado do contribuinte (mTLS)** para os endpoints de contribuintes ISSQN, como o Swagger em Produção Restrita (`/swagger/contribuintesissqn/`).[^14][^15][^3]
2. **Consumir Parâmetros Municipais antes de emitir**
    - Usar a **API de Parâmetros Municipais** para buscar as regras do município (código de serviço, regimes, alíquotas, retenção, exigência de intermediário etc.) e salvar isso por empresa/município no seu banco (Ex.: Supabase).[^16][^1][^6]
    - Esses parâmetros alimentam o preenchimento automático do formulário de emissão no seu SaaS e reduzem rejeição por regra de negócio.[^17][^1]
3. **Montar e enviar a DPS (`POST /nfse`)**
    - Seguir o leiaute da DPS descrito no Anexo I do manual (campos de prestador, tomador, serviço, valores, impostos, local da prestação etc.).[^1][^6]
    - No backend, montar o JSON da DPS e enviar para o endpoint de emissão NFS-e da SEFIN Nacional (`POST /nfse`) em Produção Restrita; o retorno será a NFS-e gerada (com chave de acesso) ou uma rejeição com códigos/mensagens que você deve exibir/logar para o usuário.[^2][^6]
4. **Consultar, armazenar e gerar DANFSe**
    - Após a autorização, usar `GET /nfse/{chaveAcesso}` para buscar o XML (geralmente compactado/encodeado) e salvar os principais dados da nota na sua base multi-tenant (NFS-e, chave, status, valores, município, CNPJ emissor).[][^6][^2]
    - Chamar a API de **DANFSe** (links da seção DANFSe da mesma página de APIs) passando a chave de acesso para obter o PDF, que você pode servir via link no painel ou enviar por e-mail/WhatsApp.[^5][^7][^6]

## Pontos de arquitetura no seu SaaS

- Separar uma **camada de “Fiscal Service”** no backend, com um módulo para “NFS-e Nacional (SEFIN)” que recebe um DTO genérico do seu ERP e converte para o payload de DPS da API oficial.[^17][^6]
- Modelar tabelas por empresa/tenant: credenciais (certificado, password/PKCS12), parâmetros por município, histórico de DPS/NFS-e, eventos (cancelamento, substituição) e logs de requisições/respostas para auditoria.[^1][^6]
- Usar filas/queues para reenvio assíncrono e tratamento de erros (por exemplo, quando a API nacional está intermitente), guardando o status “pendente”, “autorizada” ou “rejeitada” e notificando o cliente via webhooks ou notificações internas.[^2][^6]


## Próximos passos práticos

- Ler na íntegra o **Guia das APIs do Emissor Público Nacional** e montar um client mínimo chamando `POST /nfse` no Swagger de Produção Restrita com um CNPJ de teste.[^11][^3][^1]
- Definir, no seu código, uma interface de repositório para Parâmetros Municipais, DPS e NFS-e, e a partir daí evoluir para cancelamento, substituição e integração com o ADN/consulta pública conforme forem surgindo requisitos dos clientes.[^18][^6][^1]

Se quiser, na próxima mensagem dá para montar um exemplo de estrutura de pastas/serviços em Node/TypeScript pensado para SaaS multi-tenant, já organizado para falar com esses endpoints da SEFIN Nacional.
<span style="display:none">[^19][^20][^21][^22][^23][^24][^25][^26][^27]</span>

<div align="center">⁂</div>

[^1]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-emissor-publico-api-sistema-nacional-nfs-e-v1-2-out2025.pdf

[^2]: https://forum.nfsebrasil.com.br/t/primeiros-passos-para-emisao-do-dps-no-ambiente-nacional/129

[^3]: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/

[^4]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao

[^5]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao

[^6]: https://notagateway.com.br/blog/api-nfse-nacional/

[^7]: https://www.nfse.gov.br/ConsultaPublica/Download/DANFSe?chave=ZmZKUitUWWtHZy9BdGJ4ZWtyczBSajZGVVJiS3REVjVaSXZiOSt2cmVidjZRVHUwMXVndkRacHVTNkVjRzlCM0RpZldpbG5OdW5JPQ2

[^8]: https://blog.tecnospeed.com.br/nfse-nacional-tudo/

[^9]: https://nfe.io/blog/nota-fiscal/nfse-nacional/

[^10]: https://www.perplexity.ai/search/3a7b868f-fad8-40f9-a6e6-d81d5510a843

[^11]: https://www.dinamicasistemas.com.br/upload/files/Manual Contribuintes Emissor Público API - Sistema Nacional NFS-e v1_2%20out-2025.pdf

[^12]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-emissor-publico-api-sistema-nacional-nfs-e-v1-2-out2025.pdf/view

[^13]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-emissor-publico-api-sistema-nacional-nfs-e-v1-2-out2025.pdf/@@download/file

[^14]: https://www.pirassununga.sp.gov.br/noticias/comunicado/iss-online-e-nfs-e-nacional

[^15]: http://www.imbe.rs.gov.br/conteudo/13584/845/13381?titulo=TESTES+NFS-E+NACIONAL

[^16]: https://www.gov.br/nfse/pt-br/municipios/produtos-disponiveis/api-de-integracao

[^17]: https://blog.tecnospeed.com.br/api-nfse-nacional-o-que-e-e-como-integrar/

[^18]: https://blog.tecnospeed.com.br/ambiente-de-dados-nacional-da-nfs-e/

[^19]: https://www.legisweb.com.br/noticia/?id=31573

[^20]: https://mitysafe.com.br/nfs-e-nacional-documentacao-atualizada/

[^21]: http://www.cittainformatica.com.br/download/Manual_API_NFS-e_v1.2.pdf

[^22]: https://www.tabnews.com.br/CesarMasserati/nfs-e-nacional-implementacao-via-webservice-api

[^23]: https://notagateway.com.br/wp-content/uploads/2025/11/Manual-Municipios-APIs-ADN-Sistema-Nacional-NFS-e-v1.2-out21025.pdf

[^24]: https://nfservico.com.br/api/

[^25]: https://sebrae.com.br/Sebrae/Portal Sebrae/UFs/SP/nfe/versoes_nfe.pdf

[^26]: https://www.dinamicasistemas.com.br/upload/files/Manual Municípios APIs ADN - Sistema Nacional NFS-e v1_2%20out21-025-1.pdf

[^27]: https://focusnfe.com.br/doc/

