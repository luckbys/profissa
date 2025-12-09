Manual de Orientação 

do Contribuinte 

Versão 2.04 

Setembro/2018 





Página 2 de 74 



Revisão 2.04 





SUMÁRIO 



1 

INTRODUÇÃO ................................................................................................ 4 

2 

OBJETIVOS .................................................................................................... 5 

3 

CONSIDERAÇÕES INICIAIS ......................................................................... 6 

4 

CONCEITO ..................................................................................................... 7 

5 

PREMISSAS E REGRAS DE NEGÓCIO ........................................................ 8 

## 5.1 

GERAÇÃO DE NFS-E .................................................................................. 8 

## 5.2 

PROCESSO DE ENVIO DE RPS ..................................................................... 9 

## 5.3 

AMBIENTE DE TESTES ............................................................................... 10 

6 

ESTRUTURA DA SOLUÇÃO PARA NFS-E ................................................ 11 

## 6.1 

FUNCIONALIDADES DISPONÍVEIS ................................................................ 11 

6.1.1 

GERAÇÃO DE NFS-E ............................................................................. 11 

6.1.2 

RECEPÇÃO E PROCESSAMENTO DE LOTE DE RPS ................................... 11 

6.1.3 

ENVIAR LOTE DE RPS SÍNCRONO .......................................................... 12 

6.1.4 

CANCELAMENTO DE NFS-E.................................................................... 12 

6.1.5 

SUBSTITUIÇÃO DE NFS-E ...................................................................... 13 

6.1.6 

CONSULTA DE NFS-E POR RPS ............................................................. 13 

6.1.7 

CONSULTA DE LOTE DE RPS ................................................................. 13 

6.1.8 

CONSULTA DE NFS-E – SERVIÇOS PRESTADOS ...................................... 13 

6.1.9 

CONSULTA DE NFS-E – SERVIÇOS TOMADOS OU INTERMEDIADOS ............ 13 

6.1.10 CONSULTA POR FAIXA DE NFS-E ........................................................... 14 

6.1.11 CONSULTA DE EMPRESAS AUTORIZADAS A EMITIR NFS-E ........................ 14 

7 

ARQUITETURA DE COMUNICAÇÃO COM O CONTRIBUINTE ................ 15 

## 7.1 

ARQUITETURA DA SOLUÇÃO ON-LINE ......................................................... 15 

7.1.1 

GERAÇÃO DE NFS-E ............................................................................. 15 

7.1.2 

RECEPÇÃO E PROCESSAMENTO DE LOTE DE RPS ................................... 15 

7.1.3 

CANCELAMENTO DE NFS-E.................................................................... 15 

7.1.4 

SUBSTITUIÇÃO DE NFS-E ...................................................................... 16 

7.1.5 

CONSULTA DE EMPRESAS AUTORIZADAS A EMITIR NFS-E ........................ 16 

7.1.6 

CONSULTA DE LOTE DE RPS ................................................................. 16 

7.1.7 

CONSULTA DE NFS-E POR RPS ............................................................. 16 

7.1.8 

CONSULTA DE NFS-E – SERVIÇOS PRESTADOS ...................................... 17 

7.1.9 

CONSULTA DE NFS-E – SERVIÇOS TOMADOS OU INTERMEDIADOS ............ 17 

7.1.10 CONSULTA POR FAIXA DE NFS-E ........................................................... 17 

## 7.2 

ARQUITETURA DA SOLUÇÃO WEB SERVICES ............................................... 17 

7.2.1 

RECEPÇÃO E PROCESSAMENTO DE LOTE DE RPS ................................... 17 

7.2.2 

ENVIAR LOTE DE RPS SÍNCRONO .......................................................... 18 

7.2.3 

GERAÇÃO DE NFS-E ............................................................................. 19 

7.2.4 

CANCELAMENTO DE NFS-E.................................................................... 19 

7.2.5 

SUBSTITUIÇÃO DE NFS-E ...................................................................... 20 



2





Página 3 de 74 



Revisão 2.04 





7.2.6 

CONSULTA DE LOTE DE RPS ................................................................. 20 

7.2.7 

CONSULTA DE NFS-E POR RPS ............................................................. 21 

7.2.8 

CONSULTA DE NFS-E – SERVIÇOS PRESTADOS ...................................... 22 

7.2.9 

CONSULTA DE NFS-E – SERVIÇOS TOMADOS OU INTERMEDIADOS ............ 22 

7.2.10 CONSULTA DE NFS-E POR FAIXA ............................................................ 23 

## 7.3 

PADRÕES TÉCNICOS ................................................................................. 24 

7.3.1 

PADRÃO DE COMUNICAÇÃO ................................................................... 24 

7.3.2 

PADRÃO DE CERTIFICADO DIGITAL ......................................................... 25 

7.3.3 

PADRÃO DE ASSINATURA DIGITAL........................................................... 25 

7.3.4 

VALIDAÇÃO DE ASSINATURA DIGITAL PELO SISTEMA NFS-E ..................... 27 

7.3.5 

USO DE ASSINATURA COM CERTIFICADO DIGITAL .................................... 27 

## 7.4 

PADRÃO DAS MENSAGENS XML ................................................................ 27 

7.4.1 

ÁREA DO CABEÇALHO ........................................................................... 28 

7.4.2 

VALIDAÇÃO DA ESTRUTURA DAS MENSAGENS XML .................................. 28 

7.4.3 

SCHEMAS XML \(ARQUIVOS XSD\)........................................................... 29 

7.4.4 

VERSÃO DOS SCHEMAS XML ................................................................. 29 

8 

ESTRUTURA DE DADOS ............................................................................ 30 

## 8.1 

FORMATOS E PADRÕES UTILIZADOS ........................................................... 30 

## 8.2 

TIPOS SIMPLES ........................................................................................ 31 

## 8.3 

TIPOS COMPLEXOS ................................................................................... 34 

9 

ESTRUTURA DE DADOS DO WEB SERVICE ............................................ 47 

## 9.1 

MODELO OPERACIONAL ............................................................................ 47 

9.1.1 

SERVIÇOS SÍNCRONOS .......................................................................... 47 

9.1.2 

SERVIÇOS ASSÍNCRONOS ...................................................................... 48 

## 9.2 

DETALHAMENTO DOS SERVIÇOS ................................................................. 49 

9.2.1 

RECEPÇÃO DE LOTE DE RPS ................................................................. 50 

9.2.2 

ENVIAR LOTE DE RPS SÍNCRONO .......................................................... 50 

9.2.3 

GERAÇÃO DE NFS-E ............................................................................. 51 

9.2.4 

CANCELAMENTO NFS-E ........................................................................ 52 

9.2.5 

SUBSTITUIÇÃO NFS-E ........................................................................... 52 

9.2.6 

CONSULTA DE LOTE DE RPS ................................................................. 53 

9.2.7 

CONSULTA DE NFS-E POR RPS ............................................................. 54 

9.2.8 

CONSULTA DE NFS-E – SERVIÇOS PRESTADOS ...................................... 54 

9.2.9 

CONSULTA DE NFS-E – SERVIÇOS TOMADOS OU INTERMEDIADOS ............ 55 

9.2.10 CONSULTA DE NFS-E POR FAIXA ............................................................ 56 

10 

ESTRUTURAS DE DADOS ...................................................................... 57 

10.1 LEGENDA ................................................................................................. 57 

10.2 NOTA FISCAL DE SERVIÇOS ELETRÔNICA ................................................... 57 

10.3 RECIBO PROVISÓRIO DE SERVIÇOS ............................................................ 65 

11 

GLOSSÁRIO ............................................................................................. 71 





3





Página 4 de 74 



Revisão 2.04 





1 INTRODUÇÃO 

O projeto Nota Fiscal de Serviços Eletrônica foi concebido e é mantido em reuniões do Grupo de Trabalho 01 da Câmara Técnica Permanente da Associação Brasileira das Secretários de Finanças das Capitais \(ABRASF\), composto por representantes dos municípios integrantes e que tem como principal objetivo a geração de um modelo de processo que considerasse as necessidades e as legislações de cada município. 

Este documento apresenta o modelo para o desenvolvimento de sistemas de Nota Fiscal de Serviços Eletrônica – NFS-e, capazes de viabilizar o sincronismo de informações entre contribuintes e municípios, para implementação em Secretarias Municipais de Finanças. 

Dessa forma, poderão atuar de forma integrada com o compartilhamento de informações que viabilizarão controle fiscal e de arrecadação do ISS, como forma de se adequarem à nova realidade tributária. 

As bases para o desenvolvimento deste modelo foram definidas em reuniões presenciais e áudio conferências entre os representantes das áreas de Tecnologia da Informação - TI e de Negócios, designados pelos municípios para integrarem o Grupo de Trabalho da NFS-e da Câmara Técnica Permanente da ABRASF e teve como foco a geração de um modelo de processo que considerasse as necessidades e as legislações de cada município. 

Também tem como objetivo apresentar as especificações e critérios técnicos necessários para preparação de lotes de RPS, de modo que possam ser enviados pelo sistema on-line ou utilizando Web Service disponibilizado pelas Administrações Tributárias Municipais para as empresas prestadoras e/ou tomadoras de serviços. 

O uso do Web Service propicia às empresas que se integrem seus próprios sistemas de informações com o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais. Desta forma, consegue-se automatizar o processo de geração, substituição, cancelamento e consulta de NFS-e. 

O modelo proposto não substitui as metodologias de desenvolvimento de sistemas aplicadas pelas áreas de Tecnologia da Informação - TI de cada município. Destina-se à especificação de um modelo para a padronização dos processos e sincronismo de informações. 

A nomenclatura Nota Fiscal de Serviços Eletrônica ou a sigla NFS-e, conforme o caso, serão sempre utilizadas para se identificar esse documento fiscal. 





4





Página 5 de 74 



Revisão 2.04 





2 OBJETIVOS 

Cumprir o disposto no inciso XXII do art. 37 da Constituição Federal, incluído pela Emenda Constitucional nº 42, de 19 de dezembro de 2003, segundo o qual as administrações tributárias da União, dos Estados, do Distrito Federal e dos Municípios, atividades essenciais ao funcionamento do Estado, atuarão de forma integrada, inclusive com o compartilhamento de cadastros e de informações fiscais, na forma da lei ou convênio. 

Atender aos “Protocolos de Cooperação ENAT nºs 02 e 03/2005 - II ENAT” que dispuseram sobre o desenvolvimento e a implantação do Sistema Público de Escrituração Digital – SPED e da Nota Fiscal Eletrônica – NF-e, integrante desse sistema. 

Atender ao “Protocolo de Cooperação ENAT nº 01/2006 - III ENAT”, que instituiu a Nota Fiscal de Serviços Eletrônica – NFS-e com vistas ao compartilhamento de informações entre os fiscos municipais, estaduais e federal, por meio do desenvolvimento de uma solução para a geração desse documento fiscal eletrônico como instrumento de controle da arrecadação e fiscalização do ISS. 

Atender ao “Protocolo de Cooperação ENAT nº 02/2008 - IV ENAT”, que dispõe sobre a especificação do Modelo Conceitual Nacional da NFS-e, o desenvolvimento da Sefin Virtual e sua implantação no Ambiente Nacional Sped. 

Esse modelo também visa beneficiar as administrações tributárias padronizando e melhorando a qualidade das informações, racionalizando os custos e gerando maior eficácia, bem como aumentar a competitividade das empresas brasileiras pela racionalização das obrigações acessórias \(redução do “custo-Brasil”\), em especial a dispensa da emissão e guarda de documentos em papel. 





5





Página 6 de 74 



Revisão 2.04 





3 CONSIDERAÇÕES INICIAIS 

Este documento apresenta o modelo para o desenvolvimento de sistemas de Nota Fiscal de Serviços Eletrônica – NFS-e, capazes de viabilizar o sincronismo de informações entre contribuintes e municípios, para implementação em Secretarias Municipais de Finanças. 

Dessa forma, poderão atuar de forma integrada com o compartilhamento de informações que viabilizarão controle fiscal e de arrecadação do ISS, como forma de se adequarem à nova realidade tributária. 

As bases para o desenvolvimento deste modelo foram definidas em reuniões presenciais e áudio conferências entre os representantes das áreas de Tecnologia da Informação - TI e de Negócios, designados pelos municípios para integrarem o Grupo de Trabalho da NFS-e da Câmara Técnica Permanente da ABRASF e teve como foco a geração de um modelo de processo que considerasse as necessidades e as legislações de cada município. 

Também tem como objetivo apresentar as especificações e critérios técnicos necessários para preparação de lotes de RPS, de modo que possam ser enviados pelo sistema on-line ou utilizando Web Service disponibilizado pelas Administrações Tributárias Municipais para as empresas prestadoras e/ou tomadoras de serviços. 

O uso do Web Service propicia às empresas que se integrem seus próprios sistemas de informações com o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais. Desta forma, consegue-se automatizar o processo de geração, substituição, cancelamento e consulta de NFS-e. 

O modelo proposto não substitui as metodologias de desenvolvimento de sistemas aplicadas pelas áreas de Tecnologia da Informação - TI de cada município. Destina-se à especificação de um modelo para a padronização dos processos e sincronismo de informações. 

A nomenclatura Nota Fiscal de Serviços Eletrônica ou a sigla NFS-e, conforme o caso, serão sempre utilizadas para se identificar esse documento fiscal. 



6





Página 7 de 74 



Revisão 2.04 





4 CONCEITO 

A Nota Fiscal de Serviços Eletrônica \(NFS-e\) é um documento de existência exclusivamente digital, gerado e armazenado eletronicamente pela Administração Tributária Municipal ou por outra entidade conveniada, para documentar as operações de prestação de serviços. 

A geração da NFS-e será feita, automaticamente, por meio de serviços informatizados, disponibilizados aos contribuintes. Para que sua geração seja efetuada, dados que a compõem serão informados, analisados, processados, validados e, se corretos, gerarão o documento. 

A responsabilidade pelo cumprimento da obrigação acessória de emissão da NFS-e e pelo correto fornecimento dos dados à Administração Tributária Municipal, para a geração da mesma, é do contribuinte. A NFS-e somente será gerada com a utilização dos serviços informatizados disponibilizados pelas Administrações Tributárias Municipais. Esse tipo de serviço pressupõe riscos inerentes à ininterrupta disponibilidade, podendo, eventualmente, em alguns momentos tornar-se indisponível. 

Visando manter as atividades dos contribuintes ininterruptas, independente de os serviços informatizados disponibilizados pelas Administrações Tributárias Municipais estarem disponíveis, a administração poderá criar, segundo a sua conveniência, o Recibo Provisório de Serviços \(RPS\), que é um documento de posse e responsabilidade do contribuinte, que deverá ser gerado manualmente ou por alguma aplicação local, possuindo uma numeração sequencial crescente e devendo ser convertido em NFS-e no prazo estipulado pela legislação tributária municipal. 

Por opção da Administração Tributária Municipal, um RPS poderá ser reenviado. Nesse caso, será entendido como uma retificação do RPS anteriormente enviado. Nessa situação, se o RPS reenviado for idêntico ao anterior, será ignorado. Se for diferente do anterior, será emitida uma nova NFS-e substituta e cancelada a anterior. Esta funcionalidade deverá ser implementada quando for prevista a circulação do RPS. 



7





Página 8 de 74 



Revisão 2.04 





5 PREMISSAS E REGRAS DE NEGÓCIO 

## 5.1 Geração de NFS-e 

A NFS-e contém campos que reproduzem as informações enviadas pelo contribuinte e outros que são de responsabilidade do Fisco. Uma vez gerada, a NFS-e não pode mais ser alterada, admitindo-se, unicamente por iniciativa do contribuinte, ser cancelada ou substituída, hipótese esta em que deverá ser mantido o vínculo entre a nota substituída e a nova. 

A NFS-e deve conter a identificação dos serviços em conformidade com os itens da Lista de Serviços, anexa à Lei Complementar n°116/03, acrescida daqueles que foram vetados e de um item “99.99” para “Outros serviços”. 

É possível descrever vários serviços numa mesma NFS-e, desde que relacionados a um único item da Lista de Serviços, de mesma alíquota e para o mesmo tomador de serviço. 

Quando a legislação do município assim exigir, no caso da atividade de construção civil, as NFS-e deverão ser emitidas por obra. 

A identificação do prestador de serviços será feita pelo CNPJ ou CPF, que pode ser conjugado com a Inscrição Municipal, não sendo esta de uso obrigatório. 

A informação do CNPJ do tomador do serviço é obrigatória para pessoa jurídica, exceto quando se tratar de tomador do exterior. 

A competência de uma NFS-e é a data da ocorrência do fato gerador, devendo ser informada pelo contribuinte. 

O Código do Município da Incidência deve ser informado quando Exigibilidade do ISS for Exigível, Isenção, Imunidade, Exigibilidade Suspensa por Decisão Judicial ou Exigibilidade Suspensa por Processo Administrativo. Nos demais casos, se informado será considerado erro. 

Quando Exigibilidade do ISS for Exigibilidade Suspensa por Decisão Judicial ou Exigibilidade Suspensa por Processo Administrativo deve-se informar o Número do Processo. 

O Valor Líquido da NFS-e é calculado pelo Valor Total de Serviços subtraindo-se: Valor do PIS, COFINS, INSS, IR, CSLL, Outras Retenções, ISS Retido, Desconto Incondicionado e Desconto Condicionado. 

A base de cálculo da NFS-e é o Valor Total de Serviços, subtraídos o Valor de Deduções previstas em lei e o Desconto Incondicionado. 

O Valor do ISS devido é definido de acordo com a Exigibilidade do ISS, o Código do Município da Incidência, a Opção pelo Simples Nacional, o Regime Especial de Tributação e o ISS Retido, e será sempre calculado, exceto nos seguintes casos: 

 A Exigibilidade do ISS for Exigível, o Código do Município da Incidência for igual ao Município Gerador do Documento \(tributação no município\) e o Regime 8





Página 9 de 74 



Revisão 2.04 





Especial de Tributação for Microempresa Municipal ou Estimativa ou Sociedade de Profissionais; 

 A Exigibilidade do ISS for Exigível, o Código do Município da Incidência for diferente ao Município Gerador do Documento \(tributação fora do município\), nesse caso os campos Alíquota de Serviço e Valor do ISS devido ficarão abertos para o prestador indique os valores; 

 A Exigibilidade do ISS for Imunidade ou Isenção ou Exportação \(de serviço\), nesses casos o ISS será calculado com alíquota zero; 

 A Exigibilidade do ISS for Não Incidência; 

 O contribuinte for Optante pelo Simples Nacional e não tiver o ISS retido na fonte. 

A alíquota do ISS é definida pela legislação municipal e se informada pelo contribuinte, será considerada erro, exceto quando: 

 A NFS-e com o Código do Município da Incidência for diferente ao Município Gerador do Documento \(tributada fora do município\), a alíquota e o valor do ISS 

serão informados pelo contribuinte; 

 O contribuinte for Optante pelo Simples Nacional e tiver o ISS retido na fonte em que está sendo emitida, a alíquota será informada pelo contribuinte. 

Caso o ISS correspondente ao serviço prestado seja devido, em partes, a diferentes municípios o contribuinte deverá utilizar uma NFS-e para cada um dos municípios beneficiados. 

## 5.2 Processo de envio de RPS 

O envio de RPS à secretaria para geração da NFS-e poderá ser feito em lotes, ou seja, vários RPS agrupados para gerar uma NFS-e para cada um deles. É possível a ocorrência de uma sobrecarga de transferência de dados entre contribuintes e secretaria, bem como sobrecarga de processamento dos RPS pelos servidores. 

Com base nessa circunstância, o serviço de “Recepção de Lote de RPS” será definido como Assíncrono. Um processo é assíncrono quando ocorre uma chamada ao mesmo, com envio de determinadas informações \(lote de RPS nesse caso\) e seu retorno é dado em outro momento. 

Como comprovante de envio de lote de RPS, o contribuinte receberá apenas um número de protocolo de recebimento. O lote recebido pela secretaria será colocado em uma fila de processamento, e será executado em momento oportuno. Depois de processado, gerará um resultado que estará disponível ao contribuinte. Esse resultado poderá ser as NFS-e correspondentes ou a lista de erros encontrados no lote. 

Os lotes também poderão ser enviados utilizando-se o serviço de “Enviar Lote de RPS 

Síncrono”. Um processo é síncrono quando ocorre uma chamada ao mesmo, com envio de determinadas informações \(lote de RPS nesse caso\) e seu retorno é dado em mesmo 9





Página 10 de 74 



Revisão 2.04 





momento, e gerará um resultado que estará enviado ao contribuinte. Esse resultado poderá ser as NFS-e correspondentes ou a lista de erros encontrados no lote. 

A numeração dos lotes de RPS é de responsabilidade do contribuinte. 

Nos serviços “Recepção e processamento de lote de RPS” e “Enviar Lote de RPS 

Síncrono”, um único erro provoca a rejeição de todo o lote. 

Um RPS pode ser enviado com o status de cancelado gerando uma NFS-e cancelada. 

Caso ele tenha sido enviado com status de normal e havendo necessidade de cancelamento do documento, deve ser cancelada a respectiva NFS-e. 

Reenvio de um lote já processado com sucesso será possível somente quando a Administração Tributária Municipal, conforme sua conveniência, conceder essa permissão. Caso contrário, o reenvio retornará uma mensagem de erro. 

Por opção da Administração Tributária Municipal, um RPS poderá ser reenviado. Nesse caso, será entendido como uma retificação do RPS anteriormente enviado. Nessa situação, se o RPS reenviado for idêntico ao anterior, será ignorado. Se for diferente do anterior, será emitida uma nova NFS-e substituta e cancelada a anterior. Essa funcionalidade deverá ser implementada quando for prevista a circulação do RPS. 

Conforme a conveniência da Administração Tributária Municipal, campos tratados neste Modelo Conceitual como opcionais, podem ser de informação obrigatória para alguns municípios. A fim de se manter a compatibilidade entre os sistemas dos municípios, se algum campo opcional não for adotado pela Administração Tributária Municipal, este será aceito e o RPS convertido em NFS-e, retornando a mensagem alertando sobre a desconsideração da informação. 

## 5.3 Ambiente de testes 

As Administrações Tributárias Municipais deverão manter um ambiente específico para realização de testes e integração das aplicações do contribuinte durante a fase de implementação e adequação do sistema de emissão de NFS-e, utilizando a solução Web Service. 



10





Página 11 de 74 



Revisão 2.04 





6 ESTRUTURA DA SOLUÇÃO PARA NFS-E 

O funcionamento do sistema de Nota Fiscal 

de Serviços Eletrônica consiste em um 

conjunto de funcionalidades automatizadas, 

disponibilizado, por meio de recursos da 

tecnologia da informação, aos prestadores 

e tomadores de serviços que geram e 

recebem notas fiscais. Utilizando estas 

funcionalidades os contribuintes podem 

gerar, cancelar e consultar notas fiscais de 

forma automatizada. 

O modelo prevê duas soluções para o sistema de NFS-e a serem disponibilizadas para o contribuinte: 

 Solução on-line, disponibilizada no sítio da Administração Pública Municipal, na Internet. 

 Solução Web Service, que permita a integração com os sistemas próprios dos contribuintes e/ou um aplicativo cliente, disponibilizado pela Administração Tributária Municipal 

## 6.1 Funcionalidades Disponíveis 

6.1.1 Geração de NFS-e 

A funcionalidade de geração de NFS-e se responsabiliza por receber os dados referentes a uma prestação de serviços e gravá-los na base da Administração Tributária Municipal, gerando uma Nota Fiscal de Serviços Eletrônica. Após sua gravação, a NFS-e fica disponível para consulta e visualização. 

Caso haja alguma inconsistência nos dados informados durante o processo, a mensagem do problema é retornada ao requisitante. 

Durante o preenchimento dos dados que gerarão uma NFS-e, o contribuinte poderá fazer o seu vínculo com um RPS emitido, bastando para isso informar o número e alguns outros dados dele. 

Este é um processo síncrono. 

6.1.2 Recepção e Processamento de Lote de RPS 

A funcionalidade de recepção e processamento de lote de RPS recebe RPS enviados em um único lote, realiza a validação estrutural e de negócio de seus dados, processa os RPS e, considerando-se válido o lote, gera as NFS-e correspondentes. Caso algum RPS 

do lote contenha dado considerado inválido, todo o lote será rejeitado e as suas 11





Página 12 de 74 



Revisão 2.04 





informações não serão armazenadas na base de dados da Administração Tributária Municipal. Nesse caso, serão retornadas as inconsistências. 

Um RPS identificado como “substituto” deverá conter a numeração do RPS a ser substituído. A NFS-e do RPS substituído será cancelada e uma nova nota será gerada em substituição. A relação entre a NFS-e substituta e a substituída ficará registrada. Esta operação é permitida somente se os dois RPS \(substituído e substituto\) estiverem no mesmo lote. 

Após o processamento dos RPS e geração das NFS-e, estas ficarão disponíveis para consulta e visualização. 

Um RPS já convertido em NFS-e não pode ser reenviado, exceto por opção da Administração Tributária Municipal. Havendo necessidade de cancelamento do documento, deve ser cancelada a respectiva NFS-e. O reenvio do RPS já convertido em NFS-e, se não autorizado pela Administração Tributária Municipal, deve gerar uma mensagem de erro e todo o lote será rejeitado. 

Este é um processo assíncrono. 

6.1.3 Enviar Lote de RPS Síncrono 

A funcionalidade Enviar Lote de RPS Síncrono recebe os RPS enviados em um único lote, realiza a validação estrutural e de negócio de seus dados, processa os RPS e, considerando-se válido o lote, gera as NFS-e correspondentes. Caso algum RPS do lote contenha dado considerado inválido, todo o lote será rejeitado e as suas informações não serão armazenadas na base de dados da Administração Tributária Municipal. Nesse caso, serão retornadas as inconsistências. 

O processamento do RPS segue as mesmas regras da funcionalidade de recepção e processamento de lote de RPS, exceto quanto ao retorno que será as NFS-e geradas ou as inconsistências 

Este é um processo síncrono. 

6.1.4 Cancelamento de NFS-e 

A funcionalidade de cancelamento de NFS-e cancela uma Nota Fiscal de Serviços Eletrônica já emitida. 

Caso a NFS-e não tenha sido gerada \(ou já tenha sido cancelada\) uma mensagem informando o fato é retornada. 

Esta funcionalidade cancela apenas uma NFS-e gerada por vez e não vincula esse cancelamento a nenhum RPS, assim como a nenhuma nota substituta. 

Este é um processo síncrono. 



12





Página 13 de 74 



Revisão 2.04 





6.1.5 Substituição de NFS-e 

A funcionalidade de substituição de NFS-e gera uma NFS-e em substituição a outra, já gerada. A NFS-e substituída será cancelada, caso já não esteja nessa condição. Esse serviço utiliza o serviço de “Geração de NFS-e” tendo como incremento os campos que identificam a NFS-e a ser substituída, registrando o vínculo entre a nota substituta e a substituída. 

Este é um processo síncrono. 

6.1.6 Consulta de NFS-e por RPS 

A funcionalidade de consulta de NFS-e por RPS retorna os dados de uma única Nota Fiscal de Serviços Eletrônica, caso essa já tenha sido gerada. 

Caso o RPS ou a NFS-e não exista \(não tenha sido gerada ainda\), uma mensagem informando o problema é retornada. Exemplo: RPS não encontrado na base de dados. 

Este é um processo síncrono. 

6.1.7 Consulta de Lote de RPS 

A funcionalidade de consulta de lote de RPS retorna os dados de todas as NFS-e geradas a partir do envio de determinado lote de RPS. Esses dados podem então ser formatados para serem visualizados. 

Caso o lote de RPS não exista \(ou não tenha sido processado\) uma mensagem informando o problema é retornada. 

Este é um processo síncrono. 

6.1.8 Consulta de NFS-e – Serviços Prestados 

A funcionalidade de consulta de NFS-e retorna informações de uma ou mais NFS-e conforme os parâmetros de pesquisa que podem ser a identificação da própria nota, identificação do prestador; identificação do tomador ou identificação do intermediário do serviço. 

Este é um processo síncrono. 

6.1.9 Consulta de NFS-e – Serviços Tomados ou Intermediados A funcionalidade de consulta de NFS-e retorna informações de uma ou mais NFS-e conforme os parâmetros de pesquisa que podem ser a identificação da própria nota; identificação do prestador; identificação do tomador ou identificação do intermediário do serviço. 

Este é um processo síncrono. 



13





Página 14 de 74 



Revisão 2.04 





6.1.10 Consulta por Faixa de NFS-e 

A funcionalidade de consulta por faixa de NFS-e retorna informações de uma ou mais NFS-e conforme os parâmetros de pesquisa que podem ser a identificação da nota inicial; identificação da nota final; identificação do prestador; situação da NFS-e. 

Este é um processo síncrono. 

6.1.11 Consulta de Empresas Autorizadas a Emitir NFS-e A funcionalidade de consulta de empresas autorizadas a emitir NFS-e informa se determinado CNPJ ou CPF está autorizado a emiti-la e sua Razão Social. 

A funcionalidade informará que a empresa não foi encontrada, caso a mesma não tenha sido cadastrada na base de dados do sistema. 

Este é um processo síncrono. 



14





Página 15 de 74 



Revisão 2.04 





7 ARQUITETURA DE COMUNICAÇÃO COM O CONTRIBUINTE 

## 7.1 Arquitetura da Solução On-Line 

A solução on-line consiste na utilização de funções, diretamente do sítio da Administração Pública Municipal, utilizando um navegador Internet \(Browser\), independente de plataforma usada para acesso, utilizando certificação digital ou identificação por meio de login e senha a serem definidos. 

A seguir estão enumeradas e detalhadas as funcionalidades que estarão disponíveis no sítio da Administração Pública Municipal, conforme os serviços contemplados no item. 

7.1.1 Geração de NFS-e 

a\) O contribuinte acessa o serviço de “Geração de NFS-e” no sítio da Administração Pública Municipal; 

b\) Informa os dados que gerarão a NFS-e e os submete para processamento. 

c\) A requisição é recebida pelo servidor Web, que valida os dados; preenchidos e, caso as informações sejam válidas, gera a NFS-e, fornecendo o seu número; d\) O Web Site retorna uma mensagem com o resultado do processamento. 

7.1.2 Recepção e Processamento de Lote de RPS 

a\) O contribuinte gera e assina digitalmente o arquivo xml com lote de RPS seguindo a mesma estrutura do serviço “Recepção e Processamento de Lote de RPS” do Web Service, utilizando a aplicação instalada em seu computador; b\) Acessa o serviço de “Recepção e Processamento de Lote de RPS” no sítio da Administração Pública Municipal; 

c\) Envia o lote para processamento; 

d\) A requisição é recebida pelo servidor Web, que valida o lote e, caso as informações sejam válidas, grava-as e gera o número de protocolo de recebimento; 

e\) O Web Site retorna uma mensagem com o número do protocolo de recebimento; f\) O lote recebido será processado posteriormente. 

7.1.3 Cancelamento de NFS-e 

a\) O contribuinte acessa o serviço de “Cancelamento de NFS-e” no sítio da Administração Pública Municipal. 

b\) Informa os dados de identificação da NFS-e desejada e submete-os para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos, identifica a NFS-e correspondente e efetua o cancelamento. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 



15





Página 16 de 74 



Revisão 2.04 





7.1.4 Substituição de NFS-e 

a\) O contribuinte acessa o serviço de “Geração de NFS-e” no sítio da Administração Pública Municipal. 

b\) Informa os dados que gerarão a nova NFS-e e os dados que identificam a NFS-e a ser substituída e submete-os para processamento. 

c\) A requisição é recebida pelo servidor Web, que valida os dados preenchidos e, caso as informações sejam válidas, gera a NFS-e substituta fornecendo seu número. Em seguida, cancela a NFS-e substituída, registrando o vínculo entre ambas. 

d\) Web Site retorna uma mensagem com o resultado do processamento. 

7.1.5 Consulta de Empresas Autorizadas a Emitir NFS-e a\) O contribuinte acessa o serviço de “Consulta de Empresas Autorizadas a Emitir NFS-e” no sítio da Administração Pública Municipal. 

b\) Informa os dados disponíveis e submete-os para processamento. 

c\) A requisição é recebida pelo servidor Web, que valida os dados preenchidos e, caso as informações sejam válidas, efetua o processamento. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 

7.1.6 Consulta de Lote de RPS 

a\) O contribuinte acessa o serviço de “Consulta de Situação de Lote de RPS” no sítio da Administração Pública Municipal. 

b\) Informa o número do lote desejado e submete os dados para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos e identifica o status do lote e, caso já esteja processado, o resultado do processamento. 

d\) O Web Site retorna uma mensagem com o resultado do processamento na mesma estrutura do arquivo xml descrito para 

o serviço “Consulta de Lote de 

RPS” do Web Service 

Observação: Os serviços a seguir poderão ser implementados em programas isolados ou agrupados desde que possuam parâmetros de pesquisa que atendam às consultas definidas neste documento: 

7.1.7 Consulta de NFS-e por RPS 

a\) O contribuinte acessa o serviço de “Consulta de NFS-e por RPS” no sítio da Administração Pública Municipal. 

b\) Informa os dados de identificação do RPS desejado e submete-os para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos e identifica a NFS-e correspondente. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 



16





Página 17 de 74 



Revisão 2.04 





7.1.8 Consulta de NFS-e – Serviços Prestados 

a\) O contribuinte acessa o serviço de “Consulta de NFS-e – Serviços Prestados” no sítio da Administração Pública Municipal. 

b\) Informa o critério de pesquisa desejado e submete os dados para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos e identifica as NFS-e correspondentes. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 

7.1.9 Consulta de NFS-e – Serviços Tomados ou Intermediados a\) O contribuinte acessa o serviço de “Consulta de NFS-e – Serviços Tomados ou Intermediados” no sítio da Administração Pública Municipal. 

b\) Informa o critério de pesquisa desejado e submete os dados para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos e identifica as NFS-e correspondentes. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 

7.1.10 Consulta por Faixa de NFS-e 

a\) O contribuinte acessa o serviço de “Consulta por Faixa de NFS-e” no sítio da Administração Pública Municipal. 

b\) Informa o critério de pesquisa desejado e submete os dados para processamento. 

c\) A requisição é recebida pelo servidor Web, que verifica os dados preenchidos e identifica as NFS-e correspondentes. 

d\) O Web Site retorna uma mensagem com o resultado do processamento. 

## 7.2 Arquitetura da Solução Web Services 

A solução Web Services consiste na disponibilização de serviços informatizados, localizados nos servidores utilizados pela da Administração Tributária Municipal. Essa solução tem como premissa a utilização de uma aplicação cliente, instalada no computador do contribuinte, que acessará, por meio da internet, os serviços do Web Service. 

A aplicação a ser instalada no computador do contribuinte poderá ser fornecida pela Administração Tributária Municipal ou desenvolvida pelo contribuinte, de acordo com as especificações previamente definidas para isso. 

O acesso à aplicação se dará por meio de certificação digital. 

A seguir, estão enumerados e detalhados os serviços que estarão disponíveis para a aplicação cliente, conforme os serviços contemplados no item. 

7.2.1 Recepção e Processamento de Lote de RPS 

Esse serviço compreende a recepção do Lote de RPS, a resposta com o número do protocolo gerado para esta transação e o processamento do lote. Quando efetuada a 17





Página 18 de 74 



Revisão 2.04 





recepção, o Lote entrará na fila para processamento posterior quando serão feitas as validações necessárias e geração das NFS-e. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: EnviarLoteRpsEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: EnviarLoteRpsResposta Passos para execução 

1. A aplicação acessa o serviço de “Recepção e Processamento de Lote de RPS” 

enviando o lote de RPS \(fluxo “b”\); 

2. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e gera o número de protocolo de recebimento \(fluxo “c”\); 3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxo “d”\); 

4. O lote recebido será processado posteriormente. 



7.2.2 Enviar Lote de RPS Síncrono 

Esse serviço compreende a recepção do Lote de RPS. Quando efetuada a recepção, o Lote será processado e serão feitas as validações necessárias e geração das NFS-e. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: EnviarLoteRpsSincronoEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: EnviarLoteRpsSincronoResposta Passos para execução 

1. A aplicação acessa o serviço de “Enviar Lote de RPS Síncrono” enviando o lote \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e processa o lote \(fluxo “2.c”\); 



18





Página 19 de 74 



Revisão 2.04 





3. O Web Service retorna uma mensagem \(a estrutura com a lista da NFS-e geradas ou as mensagens de erro\) com o resultado do processamento do serviço ou inconsistências \(fluxo “2.d”\). 

7.2.3 Geração de NFS-e 

Esse serviço compreende a recepção do RPS. Quando efetuada a recepção, e serão feitas as validações necessárias do RPS e geração das NFS-e. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: GerarNfseEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: GerarNfseResposta Passos para execução 

1. A aplicação acessa o serviço de “Geração de NFS-e” enviando o RPS \(fluxo 

“2.b”\); 

2. A requisição é recebida pelo servidor do Web Service que grava as informações recebidas e processa o RPS \(fluxo “2.c”\); 

3. O Web Service retorna uma mensagem \(a estrutura com a lista da NFS-e geradas ou as mensagens de erro\) com o resultado do processamento do serviço ou inconsistências \(fluxo “2.d”\). 

7.2.4 Cancelamento de NFS-e 

Esse serviço permite o cancelamento direto de uma NFS-e sem a sua substituição por outra. 



XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: CancelarNfseEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: CancelarNfseResposta 19





Página 20 de 74 



Revisão 2.04 





Passos para execução 

1. A aplicação acessa o serviço de “Cancelamento de NFS-e” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos, identifica a NFS-e correspondente e efetua o seu cancelamento \(fluxo “2.c”\); 

3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxo “2.d”\). 

7.2.5 Substituição de NFS-e 

Esse serviço permite o cancelamento de uma NFS-e com sua substituição por outra. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: SubstituirNfseEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: SubstituirNfseResposta Passos para execução 

1. A aplicação acessa o serviço de “Substituição de NFS-e” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados fornecidos, identifica a NFS-e correspondente, processa o RPS, gera a nova NFS-e e efetua o cancelamento da NFS-e substituída \(fluxo “2.c”\); 3. O Web Service retorna uma mensagem \(a estrutura com NFS-e gerada e a substituída ou as mensagens de erro\) como resultado do processamento do serviço \(fluxo “2.d”\). 

7.2.6 Consulta de Lote de RPS 

Esse serviço permite que contribuinte obtenha as NFS-e que foram geradas a partir do Lote de RPS enviado, quando o processamento ocorrer sem problemas; ou que obtenha a lista de erros e/ou inconsistências encontradas nos RPS. 

Na validação do lote, devem ser retornados todos os erros verificados. 

Excepcionalmente, havendo uma excessiva quantidade de erros, poderá ser definido um limitador para a quantidade de erros retornados. 



20





Página 21 de 74 



Revisão 2.04 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarLoteRpsEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarLoteRpsResposta Passos para execução 

1. A aplicação acessa o serviço de “Consulta de Lote de RPS” e submete os dados para processamento \(fluxo “b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes \(fluxos “c” e “d”\); 3. O Web Service retorna uma mensagem \(a estrutura com a lista da NFS-e geradas ou as mensagens de erro\) com o resultado do processamento do serviço ou inconsistências \(fluxo “e”\). 

7.2.7 Consulta de NFS-e por RPS 

Esse serviço efetua a consulta de uma NFS-e a partir do número de RPS que a gerou. 



XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseRpsEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseRpsResposta Passos para execução 

1. A aplicação acessa o serviço de “Consulta de NFS-e por RPS” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica a NFS-e correspondente \(fluxos “2.c” e “2.d”\); 3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxo “2.e”\); 

4. Caso a quantidade de NFS-e seja superior ao limite de 50 notas, uma mensagem informando o problema é retornada. Exemplo: Consulta selecionou mais de 50 

NFS-e, mais do que o permitido. 



21





Página 22 de 74 



Revisão 2.04 





7.2.8 Consulta de NFS-e – Serviços Prestados 

Esse serviço permite a obtenção de determinada NFS-e já gerada. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseServicoPrestadoEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseServicoPrestadoResposta 

Passos para execução 

1. A aplicação acessa o serviço de “Consulta de NFS-e” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes \(fluxos “2.c” e “2.d”\); 3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxos “2.e”\); 

4. Caso a quantidade de NFS-e seja superior ao limite de 50 notas, uma mensagem informando o problema é retornada. Exemplo: Consulta selecionou mais de 50 

NFS-e, mais do que o permitido. 

7.2.9 Consulta de NFS-e – Serviços Tomados ou Intermediados Esse serviço permite a obtenção de determinada NFS-e já gerada. 





XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseServicoTomadoEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseServicoTomadoResposta 





22





Página 23 de 74 



Revisão 2.04 





Passos para execução 

1. A aplicação acessa o serviço de “Consulta de NFS-e” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes \(fluxos “2.c” e “2.d”\); 3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxos “2.e”\); 

4. Caso a quantidade de NFS-e seja superior ao limite de 50 notas, uma mensagem informando o problema é retornada. Exemplo: Consulta selecionou mais de 50 

NFS-e, mais do que o permitido. 



7.2.10 Consulta de NFS-e por faixa 

Esse serviço permite a obtenção de determinada NFS-e já gerada. 



XML de Envio é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseFaixaEnvio XML de Resposta é validado pelo elemento do schema do arquivo nfse.xsd: ConsultarNfseFaixaResposta Passos para execução 

1. A aplicação acessa o serviço de “Consulta de NFS-e por faixa” e submete os dados para processamento \(fluxo “2.b”\); 

2. A requisição é recebida pelo servidor do Web Service, que verifica os dados preenchidos e identifica as NFS-e correspondentes \(fluxos “2.c” e “2.d”\); 3. O Web Service retorna uma mensagem com o resultado do processamento do serviço \(fluxos “2.e”\); 

4. Caso a quantidade de NFS-e seja superior ao limite de 50 notas, uma mensagem informando o problema é retornada. Exemplo: Consulta selecionou mais de 50 

NFS-e, mais do que o permitido. 



23





Página 24 de 74 



Revisão 2.04 





## 7.3 Padrões Técnicos 

7.3.1 Padrão de Comunicação 

HTTPS 

REQUISIÇÃO 

CONTRIBUINTE 

ADMINISTRAÇÃO TRIBUTÁRIA MUNICIPAL 



O meio físico de comunicação utilizado entre os sistemas de informação dos contribuintes e o Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais será a Internet, com o uso do protocolo SSL, que além de garantir um duto de comunicação seguro na Internet, permite a identificação do servidor e do cliente com a utilização de certificados digitais, eliminando a necessidade de identificação do usuário com a utilização de nome ou código de usuário e senha. 

O modelo de comunicação segue o padrão de Web Services definido pelo WS-I Basic Profile. 

A troca de mensagens entre o Web Service do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais e o sistema do contribuinte será realizada no padrão SOAP, com troca de mensagens XML no padrão Style/Enconding: Document/Literal, wrapped. A opção “wrapped” representa a chamada aos métodos disponíveis com a passagem de mais de um parâmetro. Para descrever os serviços disponibilizados, será utilizado um documento WSDL \(Web Service Description Language\). O WSDL é o padrão recomendado para descrição de serviços SOAP. 





SOAP 





Requerente 

Provedor 



do Serviço 

do Serviço 





As chamadas aos serviços serão feitas enviando como parâmetro um documento XML a ser processado pelo sistema. Esse documento não fará parte da descrição do serviço \(arquivo WSDL\), e o formato do XML correspondente ao serviço está definido neste manual de integração, seção 4.5. 



24





Página 25 de 74 



Revisão 2.04 





7.3.2 Padrão de Certificado Digital 

Os certificados digitais utilizados no sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais, serão emitidos por Autoridade Certificadora credenciada pela Infraestrutura de Chaves Públicas Brasileira – ICP-Brasil, de pessoa física ou jurídica, dos tipos A1 ou A3. 

Para a assinatura digital dos documentos envolvidos aceitar-se-á que o certificado digital seja de quaisquer dos estabelecimentos da empresa. 

Os certificados digitais serão exigidos em 2 \(dois\) momentos distintos para a integração entre o sistema do contribuinte e o Web Service das Administrações Públicas Municipais: 

 Assinatura de Mensagens: O certificado digital utilizado para essa função deverá conter o CNPJ do estabelecimento emissor da NFS-e ou o CNPJ do estabelecimento matriz ou CPF quando o prestador de serviços for pessoa física. 

O certificado digital deverá ter o “uso da chave” previsto para a função de assinatura digital, respeitando a Política do Certificado. 

 Transmissão \(durante a transmissão das mensagens entre os servidores do contribuinte e os serviços disponibilizados pelas Administrações Públicas Municipais\). O certificado digital utilizado para identificação do aplicativo do contribuinte deverá conter o CNPJ do responsável pela transmissão das mensagens, mas não necessita ser o mesmo CNPJ do estabelecimento ou CPF, quando o prestador de serviços for pessoa física, emissor da NFS-e, devendo ter a extensão extended Key Usage com permissão de "Autenticação Cliente". 

7.3.3 Padrão de Assinatura Digital 

As mensagens enviadas aos serviços disponibilizados pelas Administrações Tributárias Municipais são documentos eletrônicos elaborados no padrão XML e devem ser assinados digitalmente com um certificado digital que contenha o CNPJ do estabelecimento matriz ou o CNPJ do estabelecimento ou o CPF do prestador de serviços emissor da NFS-e objeto do pedido. 

Para garantir minimamente a integridade das informações prestadas e a correta formação dos arquivos XML, o contribuinte deverá submeter as mensagens XML para validação pela linguagem de Schema do XML \(XSD – XML Schema Definition\), disponibilizada pelas Administrações Tributárias Municipais antes de seu envio. 

Os elementos abaixo estão presentes dentro do certificado do contribuinte tornando desnecessária a sua representação individualizada no arquivo XML. Portanto, o arquivo XML não deve conter os elementos: 

<X509SubjectName> 

<X509IssuerSerial> 

<X509IssuerName> 

<X509SerialNumber> 

<X509SKI> 



25





Página 26 de 74 



Revisão 2.04 





Deve-se evitar o uso das TAGs abaixo, pois as informações serão obtidas a partir do certificado do emitente: 

<KeyValue> 

<RSAKeyValue> 

<Modulus> 

<Exponent> 

O Projeto NFS-e utiliza um subconjunto do padrão de assinatura XML definido pelo http://www.w3.org/TR/xmldsig-core/, que tem o seguinte leiaute: 

\# 

Campo 

Elemento Pai 

Tipo 

Ocorrência Descrição 

XS01 Signature 

Raiz 





XS02 Id 

A 

XS01 

C 

1-1 



XS03 SignedInfo 

G 

XS01 



1-1 

Grupo da Informação da assinatura 

XS04 CanonicalizationMethod 

G 

XS03 



1-1 

Grupo do Método de Canonicalização 

XS05 Algorithm 

A 

XS04 

C 

1-1 

Atributo Algorithm de CanonicalizationMethod: 

http://www.w3.org/TR/2001/REC-xml-c14n-

20010315 

XS06 SignatureMethod 

G 

XS03 



1-1 

Grupo do Método de Assinatura 

XS07 Algorithm 

A 

XS06 

C 

1-1 

Atributo Algorithm de SignedInfo: 

http://www.w3.org/2000/09/xmldsig\#rsa-sha1 

XS08 Reference 

G 

XS03 



1-1 

Grupo do Método de Reference 

XS09 URI 

A 

XS08 

C 

1-1 

Atributo URI da tag Reference 

XS10 Transforms 

G 

XS08 



1-1 

Grupo do algorithm de Transform 

XS11 Unique\_Transf\_Alg 

RC 

XS10 



1-1 

Regra para o atributo Algorithm do Transform 

ser único 

XS12 Transform 

G 

XS10 



2-2 

Grupo de Transform 

XS13 Algorithm 

A 

XS12 

C 

1-1 

Atributos válidos Algorithm do Transform: 

http://www.w3.org/TR/2001/REC-xml-c14n-

20010315 

http://www.w3.org/2000/09/xmldsig\#enveloped

-signature 

XS14 Xpath 

E 

XS12 

C 

0-N 

Xpath 

XS15 DigestMethod 

G 

XS08 



1-1 

Grupo do Método de DigestMethod 

XS16 Algorithm 

A 

XS15 

C 

1-1 

Atributo Algorithm de DigestMethod: 

http://www.w3.org/2000/09/xmldsig\#sha1 

XS17 DigestValue 

E 

XS08 

C 

1 

Digest Value \(Hash SHA-1 – Base64\) 

XS18 SignatureValue 

G 

XS01 



1-1 

Grupo do Signature Value 

XS19 KeyInfo 

G 

XS01 



1-1 

Grupo do KeyInfo 

XS20 X509Data 

G 

XS19 



1-1 

Grupo X509 

XS21 X509Certificate 

E 

XS20 

C 

1-1 

Certificado Digital x509 em Base64b 



Observação: 

Os RPS’s e lote devem ser assinados conforme os seguintes passos: 26





Página 27 de 74 



Revisão 2.04 





1. Assinatura do RPS isoladamente  neste momento deve ser identificado o namespace \(http://www.abrasf.org.br/nfse.xsd\) em cada RPS que será assinado 2. Agrupar todos os RPS assinados em um único lote 3. Assinar o lote com os RPS's, também identificando o namespace http://www.abrasf.org.br/nfse.xsd 

7.3.4 Validação de Assinatura Digital pelo Sistema NFS-e Para a validação da assinatura digital, seguem as regras que serão adotadas pelas Administrações Tributárias Municipais: 

1. Extrair a chave pública do certificado; 

2. Verificar o prazo de validade do certificado utilizado; 3. Montar e validar a cadeia de confiança dos certificados validando também a LCR 

\(Lista de Certificados Revogados\) de cada certificado da cadeia; 4. Validar o uso da chave utilizada \(Assinatura Digital\) de tal forma a aceitar certificados somente do tipo A \(não serão aceitos certificados do tipo S\); 5. Garantir que o certificado utilizado é de um usuário final e não de uma Autoridade Certificadora; 

6. Adotar as regras definidas pelo RFC 3280 para LCRs e cadeia de confiança; 7. Validar a integridade de todas as LCR utilizadas pelo sistema; 8. Prazo de validade de cada LCR utilizada \(verificar data inicial e final\). 

A forma de conferência da LCR fica a critério de cada Administração Tributária Municipal, podendo ser feita de 2 \(duas\) maneiras: On-line ou Download periódico. As assinaturas digitais das mensagens serão verificadas considerando o horário fornecido pelo Observatório Nacional. 

7.3.5 Uso de Assinatura com Certificado Digital Para garantir a autenticidade dos dados gerados, algumas informações poderão ser assinadas digitalmente, conforme determinação Administração Tributária Municipal. As informações que poderão ser assinadas e quem deverá fazê-lo em cada momento são: 

 O RPS, pelo contribuinte, antes do envio do Lote de RPS que o contenha; 

 O Lote de RPS, pelo contribuinte, antes do seu envio; 

 A NFS-e: 

o Pela Administração Tributária Municipal e pelo contribuinte, quando gerada pela Aplicação On Line; 

o Pela Administração Tributária Municipal nos demais casos; 

 O Pedido de cancelamento da NFS-e, pelo contribuinte; 

 A Confirmação de cancelamento da NFS-e, pela Administração Tributária Municipal; 

 A Confirmação de substituição da NFS-e, pela Administração Tributária Municipal. 

## 7.4 Padrão das Mensagens XML 

A especificação adotada para as mensagens XML é a recomendação W3C para XML 1.0, disponível em www.w3.org/TR/REC-xml e a codificação dos caracteres será em UTF-8. 



27





Página 28 de 74 



Revisão 2.04 





As chamadas dos Web Services disponibilizados Administrações Tributárias Municipais e os respectivos resultados do processamento são realizadas com utilização de mensagens com o seguinte padrão: 

 Área de Cabeçalho – estrutura XML padrão para todas as mensagens de chamada e retorno de resultado dos Web Services disponibilizados pelas Administrações Tributárias Municipais, que contêm os dados de controle da mensagem. A área de cabeçalho está sendo utilizada para armazenar a versão do leiaute da estrutura XML informada na área de dados 

 Área de Dados – estrutura XML variável definida na documentação do Web Service acessado. 

7.4.1 Área do Cabeçalho 

Leiaute da Área de Cabeçalho padrão: 

\# 

Nome 

Elemento Pai Tipo Ocorrência Tamanho Descrição 1 

cabecalho 

G 





1-1 



TAG raiz do cabeçalho da 

mensagem. 



Versão 

A 

1 

N 

1-1 

4 

Versão do leiaute. 

2 

versaoDados 

E 

1 

N 

1-1 

4 

O conteúdo deste campo indica a 

versão do leiaute XML da estrutura 

XML informada na área de dados da 

mensagem. 



O campo versaoDados deve conter a informação da versão do leiaute da estrutura XML 

armazenada na área de dados da mensagem. 

A estrutura XML armazenada na área de dados está definida na documentação do Web Service acessado. 

7.4.2 Validação da estrutura das Mensagens XML 

Para garantir minimamente a integridade das informações prestadas e a correta formação das mensagens XML, o contribuinte deverá submeter cada uma das mensagens XML de pedido de serviço para validação pelo seu respectivo arquivo XSD \(XML Schema Definition, definição de esquemas XML\) antes de seu envio. Neste manual utilizaremos a nomenclatura Schema XML para nos referir a arquivo XSD. 

Um Schema XML define o conteúdo de uma mensagem XML, descrevendo os seus atributos, seus elementos e a sua organização, além de estabelecer regras de preenchimento de conteúdo e de obrigatoriedade de cada elemento ou grupo de informação. 

A validação da estrutura da mensagem XML é realizada por um analisador sintático \(parser\) que verifica se a mensagem XML atende às definições e regras de seu respectivo Schema XML. 



28





Página 29 de 74 



Revisão 2.04 





Qualquer divergência da estrutura da mensagem XML em relação ao seu respectivo Schema XML, provoca um erro de validação do Schema XML. Neste caso o conteúdo da mensagem XML de pedido do serviço não poderá ser processado. 

A primeira condição para que a mensagem XML seja validada com sucesso é que ela seja submetida ao Schema XML correto. 

Assim, os sistemas de informação dos contribuintes devem estar preparados para gerar mensagens XML em seus respectivos Schemas XML em vigor. 

7.4.3 Schemas XML \(arquivos XSD\) 

O Schema XML \(arquivo XSD\) correspondente a cada uma das mensagens XML de pedido e de retorno utilizadas pelo Web Service pode ser obtido na internet acessando o Portal do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais. 

7.4.4 Versão dos Schemas XML 

Toda mudança de layout das mensagens XML do Web Service implica a atualização do seu respectivo Schema XML. 

A identificação da versão dos Schemas XML será realizada com o acréscimo do número da versão com dois dígitos no nome do arquivo XSD precedida da literal ‘\_v’, como segue: 

<Nome do Arquivo>\_v<Número da Versão>.xsd Exemplo: 

EnvioLoteRps\_v01.xsd 

A maioria dos Schemas XML definidos para a utilização do Web Service do Sistema de Notas Fiscais de Serviço Eletrônicas das Administrações Tributárias Municipais utilizam as definições de tipos simples ou tipos complexos que estão definidos em outros Schemas XML. Nesses casos, a modificação de versão do Schema básico será repercutida no Schema principal. 

As modificações de layout das mensagens XML do Web Service podem ser causadas por necessidades técnicas ou em razão da modificação de alguma legislação. As modificações decorrentes de alteração da legislação deverão ser implementadas nos prazos previstos no ato normativo que introduziu a alteração. As modificações de ordem técnica serão divulgadas pelas Administrações Tributárias Municipais e ocorrerão sempre que se fizerem necessárias. 



29





Página 30 de 74 



Revisão 2.04 





8 ESTRUTURA DE DADOS 

## 8.1 Formatos e Padrões utilizados 

Formatações de dados que devem ser seguidas para geração correta na estrutura dos arquivos: 

Formato 

Observação 

Data \(date\) 

Formato: AAAA-MM-DD 

onde: 

AAAA = ano com 4 caracteres 

MM = mês com 2 caracteres 

DD = dia com 2 caracteres 

Data/Hora \(datetime\) 

Formato AAAA-MM-DDTHH:mm:ss 

onde: 

AAAA = ano com 4 caracteres 

MM = mês com 2 caracteres 

DD = dia com 2 caracteres 

T = caractere de formatação que deve existir separando a data da hora HH = hora com 2 caracteres 

mm: minuto com 2 caracteres 

ss: segundo com 2 caracteres 

Valores Decimais \(decimal\) 

Formato: 0.00 

Não deve ser utilizado separador de milhar. O ponto \(.\) deve ser utilizado para separar a parte inteira da fracionária. 

Exemplo: 

48.562,25 = 48562.25 

1,00 = 1.00 ou 1 

0,50 = 0.50 ou 0.5 

Valores Percentuais 

Formato 00.00 

\(decimal\) 

O formato em percentual presume o valor percentual em sua forma fracionária, contendo 5 

dígitos. O ponto \(.\) separa a parte inteira da fracionária. 

Exemplo: 

62% = 62 

15% = 15 

25,32 = 25.32 



Não deve ser inserido caractere não significativo para preencher o tamanho completo do campo, ou seja, zeros antes de número ou espaço em branco após a cadeia de caracteres. A posição do campo é definida na estrutura do documento XML através de TAGs \(<tag>conteúdo</tag>\). 

A regra constante do parágrafo anterior deverá estender-se para os campos para os quais não há indicação de obrigatoriedade e que, no entanto, seu preenchimento torna-se obrigatório seja condicionado à legislação específica ou ao negócio do contribuinte. 

Nesse caso, deverá constar a TAG com o valor correspondente e, para os demais campos, deverão ser eliminadas as TAGs. 

Para reduzir o tamanho final do arquivo XML da NFS-e alguns cuidados de programação deverão ser assumidos: 

 não incluir "zeros não significativos" para campos numéricos; 

 não incluir "espaços" no início ou no final de campos numéricos e alfanuméricos; 

 não incluir comentários no arquivo XML; 



30





Página 31 de 74 



Revisão 2.04 





 não incluir anotação e documentação no arquivo XML \(TAG annotation e TAG 

documentation\); 

 não incluir caracteres de formatação no arquivo XML \("line-feed", "carriage return", 

"tab", caractere de "espaço" entre as TAGs\); 

 para quebra de linha na exibição para os campos contendo caracteres Discriminacao e Outrasinformacoes, utilizar a sequência “\\s\\n”. 

As TAGs que permitirem valores nulos devem ser omitidas da estrutura XML a ser enviada quando seus valores forem nulos. 

## 8.2 Tipos Simples 

A seguir encontra-se a tabela com a lista dos tipos simples que serão utilizados como tipos de dados. A tabela está dividida em 4 colunas, a saber: 

 Campo: nome do tipo simples; 

 Tipo: tipo primitivo de dados utilizados pelo campo: 

 C: Caractere; 

 N: Número; 

 D: Data ou Data/Hora; 

 T: Token 

 Descrição: descreve informações sobre o campo; 

 Tam.: tamanho do campo: 

 Quando forem caracteres o tamanho define a quantidade máxima de caracteres que o texto poderá ter; 

 Quando for numérico o tamanho pode ser representado das seguintes formas 

 Número inteiro, que define o total de dígitos existente no número. 

Exemplo: “15” significa que o número poderá ter, no máximo, 15 

dígitos; 

 Número fracionário, que define o total de dígitos e quantos deles serão designados para a parte fracionária. Exemplo: “15,2” significa que o número poderá ter, no máximo, 15 dígitos sendo 2 deles a da parte fracionária. A parte fracionária não é obrigatória quando assim definido; 

 Quando for data, não haverá definição de tamanho. 

Campo 

Tipo 

Descrição 

Tam. 

tsNumeroNfse 

N 

Número da Nota Fiscal de Serviço Eletrônica, formado 15 

por um número sequencial com 15 posições 

tsCodigoVerificacao 

C 

Código de verificação do número da nota 

9 

tsNif 

C 

Número de Identificação Fiscal: 

40 

tsStatusRps 

N 

Código de status do RPS 

1 

1 – Normal 

2 – Cancelado 

tsStatusNfse 

N 

Código de status da NFS-e 

1 

1 – Normal 

2 – Cancelado 



31





Página 32 de 74 



Revisão 2.04 





Campo 

Tipo 

Descrição 

Tam. 

tsExigibilidadeIss 

N 

Código de natureza da operação 

2 

1 – Exigível; 

2 – Não incidência; 

3 – Isenção; 

4 – Exportação; 

5 – Imunidade; 

6 – Exigibilidade Suspensa por Decisão Judicial; 7 – Exigibilidade Suspensa por Processo 

Administrativo 

tsIdentifNaoExigibilidade 

C 

Identificação da não exigibilidade do ISSQN – 

4 

somente para os casos de benefício fiscal 

tsNumeroProcesso 

C 

Número do processo judicial ou administrativo de 30 

suspensão da exigibilidade 

tsRegimeEspecialTributacao 

N 

Código de identificação do regime especial de 

2 

tributação 

1 – Microempresa municipal 

2 – Estimativa 

3 – Sociedade de profissionais 

4 – Cooperativa 

5 – Microempresário Individual \(MEI\) 

6 – Microempresa ou Empresa de Pequeno Porte 

\(ME EPP\) 

tsSimNao 

N 

Identificação de Sim/Não 

1 

1 – Sim 

2 – Não 

tsResponsavelRetencao 

N 

Identificação do responsável pela retenção do ISS 

1 

1 – Tomador 

2 – Intermediário 

tsPagina 

N 

Número da página da consulta 

6 

tsNumeroRps 

N 

Número do RPS 

15 

tsSerieRps 

C 

Número de série do RPS 

5 

tsTipoRps 

N 

Código de tipo de RPS 

1 

1 – RPS 

2 – Nota Fiscal Conjugada \(Mista\) 

3 – Cupom 

tsOutrasInformacoes 

C 

Informações adicionais ao documento. 

510 

tsValor 

N 

Valor monetário. 

15,2 

Formato: 0.00 \(ponto separando casa decimal\) 

Ex: 1.234,56 = 1234.56 

1.000,00 = 1000.00 

1.000,00 = 1000 

tsItemListaServico 

C 

Subitem do serviço prestado conforme LC 116/2003 

5 

tsCodigoCnae 

N 

Código CNAE 

7 

tsCodigoTributacao 

C 

Código de Tributação 

20 

tsDescricaoCodigoTributacaoMunicípio 

C 

Descrição do código de tributação do município. 

1000 

tsCodigoNbs 

C 

Código de NBS 

9 

tsAliquota 

N 

Alíquota. Valor percentual. 

4,2 

Formato: 00.00 

Ex: 1% = 1 

25,5% = 25.5 

10% = 10 

tsDiscriminacao 

C 

Discriminação do conteúdo da NFS-e 

2000 



32





Página 33 de 74 



Revisão 2.04 





Campo 

Tipo 

Descrição 

Tam. 

tsCodigoMunicipioIbge 

N 

Código de identificação do município conforme tabela 7 

do IBGE 

tsInscricaoMunicipal 

C 

Número de inscrição municipal 

15 

tsRazaoSocial 

C 

Razão Social do contribuinte 

150 

tsNomeFantasia 

C 

Nome fantasia 

60 

tsCnpj 

C 

Número CNPJ 

14 

tsEndereco 

C 

Tipo e nome do logradouro \(Av.., Rua..., ...\) 

255 

tsNumeroEndereco 

C 

Número do imóvel 

60 

tsComplementoEndereco 

C 

Complemento de endereço 

60 

tsBairro 

C 

Bairro 

60 

tsUf 

C 

Sigla da unidade federativa 

2 

tsCodigoPaisIbge 

C 

Código de identificação do município conforme tabela 4 

de país do IBGE 

Número do CEP 

tsCep 

C 

8 

Formato: \[0-9\]\{8\} 

tsEmail 

C 

E-mail 

80 

tsTelefone 

C 

Telefone 

20 

tsCpf 

C 

Número de CPF 

11 

tsCodigoObra 

C 

Código de Obra 

30 

tsArt 

C 

Código ART 

30 

tsIdentificacaoEvento 

C 

Identificação do evento 

30 

tsDescricaoEvento 

C 

Descrição do evento 

255 

tsInformacoesComplementares 

C 

Informações complementares para uso do prestador 2000 

de serviços conforme regulamento do município, 

preenchido no padrão JSON 

tsNumeroLote 

N 

Número do Lote de RPS 

15 

tsNumeroProtocolo 

C 

Número do protocolo de recebimento do lote RPS 

50 

tsSituacaoLoteRps 

N 

Código de situação de lote de RPS 

1 

1 – 

Não Recebido 

2 – 

Não Processado 

3 – 

Processado com Erro 

4 – 

Processado com Sucesso 

tsQuantidadeRps 

N 

Quantidade de RPS do Lote 

4 

tsCodigoMensagemAlerta 

C 

Código de mensagem de retorno de serviço. 

4 

tsDescricaoMensagemAlerta 

C 

Descrição da mensagem de retorno de serviço. 

200 

tsCodigoCancelamentoNfse 

C 

Código de cancelamento com base na tabela de Erros 4 

e alertas. 

1 – 

Erro na emissão 

2 – 

Serviço não prestado 

3 – 

Erro de assinatura 

4 – 

Duplicidade da nota 

5 – 

Erro de processamento 

Importante: Os códigos 3 \(Erro de assinatura\) e 5 

\(Erro de processamento\) são de uso restrito da 

Administração Tributária Municipal 

tsIdTag 

C 

Atributo de identificação da tag a ser assinada no 255 

documento XML 



33





Página 34 de 74 



Revisão 2.04 





Campo 

Tipo 

Descrição 

Tam. 

tsVersao 

T 

Versão do leiaute. 



Formato: \[1-9\]\{1\}\[0-9\]\{0,1\}\\.\[0-9\]\{2\} 

tsTipoDeducao 

N 

Código de identificação do tipo da dedução 

2 

1 – Materiais; 

2 – Subempreitada de mão de obra; 

3 – Serviços; 

4 – Produção externa; 

5 – Alimentação e bebidas/frigobar; 

6 – Reembolso de despesas; 

7 – Repasse consorciado; 

8 – Repasse plano de saúde; 

99 – Outras deduções 

tsDescricaoDeducao 

C 

Descrição do tipo da dedução, caso ela não seja 

150 

autoexplicativa, como “Outras deduções” 

tsNumeroNfe 

N 

Número da NF-e 

9 

tsChaveAcessoNfe 

N 

Chave de acesso da NF-e 

44 

tsIdentificacaoDocumento 

C 

Identificação e descrição de documento 

255 

tsEnderecoCompletoExterior 

C 

Descrição do endereço do exterior 

255 

## 8.3 Tipos Complexos 

A seguir são detalhadas as tabelas de cada tipo composto e seus campos. A tabela está dividida da seguinte forma: 

\(1\) 

\(2\) 

Nome 

Tipo 

Ocorrência 

Descrição 

\(4\) 

\(5\) 

\(6\) 

\(7\) 

\(3\) 

\(4\) 

\(5\) 

\(6\) 

\(7\) 



Legenda da tabela: 

\(1\) Nome do tipo complexo; 

\(2\) Descrição do tipo complexo; 

\(3\) Identifica se a sequência de campos fará parte de uma escolha \(Choice\); \(4\) Nome do campo que faz parte do tipo complexo; \(5\) Tipo do campo, que pode ser simples ou complexo; \(6\) Quantas vezes o campo se repete na estrutura de dados: a. Formato: “x-y” onde “x” é a quantidade mínima e “y” a quantidade máxima. Se a quantidade máxima for indefinida, será utilizado “N” no lugar do “y”; \(7\) Descrição do campo. 





34





Página 35 de 74 



Revisão 2.04 





tcCpfCnpj 





Número de CPF ou CNPJ 





Nome 

Tipo 

Ocorrência Descrição 

Cpf 

tsCpf 

1-1 

Número do Cpf 

Choice 

Cnpj 

tsCnpj 

1-1 

Número do Cnpj 





tcEndereco 





Representação completa do endereço 





Nome 

Tipo 

Ocorrência Descrição 

Endereco 

tsEndereco 

1-1 

Tipo e nome do logradouro 

Numero 

tsNumeroEndereco 

1-1 

Número do imóvel 

Complemento 

tsComplementoEndereco 

0-1 

Complemento do Endereço 

Bairro 

tsBairro 

1-1 

Nome do bairro 

CodigoMunicipio 

tsCodigoMunicipioIbge 

1-1 

Código da cidade 

Uf 

tsUf 

1-1 

Sigla do estado 





Cep 

tsCep 

1-1 

CEP da localidade 





tcEnderecoExterior 





Representação completa do endereço 





Nome 

Tipo 

Ocorrência Descrição 

CodigoPais 

tsCodigoPaisIbge 

1-1 

Código do país da tabela 

de país do IBGE 

EnderecoCompletoExterior 

tsEnderecoCompletoExterior 

1-1 

Descrição do endereço 





tcContato 





Representa forma de contato com a pessoa \(física/jurídica\) Nome 

Tipo 

Ocorrência Descrição 

Telefone 

tsTelefone 

1-1 

Número do telefone 

Choice 

Email 

tsEmail 

0-1 

Endereço eletrônico \(email\) 

1-1 

Email 

tsEmail 

1-1 

Endereço eletrônico \(email\) 





tcIdentificacaoOrgaoGerador 





Representa dados para identificação de órgão gerador Nome 

Tipo 

Ocorrência Descrição 

CodigoMunicipio 

tsCodigoMunicipioIbge 

1-1 

Código da cidade 

Uf 

tsUf 

1-1 

Sigla do estado 





35





Página 36 de 74 



Revisão 2.04 





tcIdentificacaoRps 





Dados de identificação do RPS 





Nome 

Tipo 

Ocorrência Descrição 

Numero 

tsNumeroRps 

1-1 

Número do RPS 

Serie 

tsSerieRps 

1-1 

Série do RPS 

Tipo 

tsTipoRps 

1-1 

Tipo do RPS 





tcIdentificacaoPessoaEmpresa 





Representa dados para identificação do prestador de serviço Nome 

Tipo 

Ocorrência Descrição 

CpfCnpj 

tcCpfCnpj 

1-1 

CPF ou CNPJ da 

empresa/pessoa 

InscricaoMunicipal 

tsInscricaoMunicipal 

0-1 

Inscrição Municipal da 

empresa/pessoa 





tcDadosTomador 





Representa dados do tomador de serviço 





Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoTomador 

tcIdentificacaoPessoaEmpresa 

0-1 

CPF ou CNPJ e Inscrição 

Municipal do tomador do 

serviços 

NifTomador 

tsNif 

0-1 

NIF do tomador do serviço, 

se do exterior 

RazaoSocial 

tsRazaoSocial 

1-1 

Razão Social do tomador 

do serviço 

Endereco 

tcEndereco 

1-1 

Endereço de tomador de 

serviços do Brasil 

Choice 

EnderecoExterior 

tcEnderecoExterior 

1-1 

Endereço de tomador de 

serviços do exterior 

Contato 

tcContato 

0-1 





tcDadosIntermediario 





Representa dados para identificação de intermediário do serviço Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoIntermediario 

tcIdentificacaoPessoaEmpresa 

1-1 

CPF ou CNPJ do 

intermediário do serviço 

RazaoSocial 

tsRazaoSocial 

1-1 

Inscrição Municipal do 

intermediário do serviços 

CodigoMunicipio 

tsCodigoMunicipioIbge 

1-1 

Código da cidade 





36





Página 37 de 74 



Revisão 2.04 





tcValoresDeclaracaoServico 





Representa um conjunto de valores que compõe a declaração do serviço Nome 

Tipo 

Ocorrência Descrição 

ValorServicos 

tsValor 

1-1 

Valor do serviço 

ValorDeducoes 

tsValor 

0-1 

Valor total das deduções 

ValorPis 

tsValor 

0-1 

Valor do PIS 

ValorCofins 

tsValor 

0-1 

Valor do CONFINS 

ValorInss 

tsValor 

0-1 

Valor do INSS 

ValorIr 

tsValor 

0-1 

Valor do imposto de renda 

ValorCsll 

tsValor 

0-1 

Valor do CSLL 

OutrasRetencoes 

tsValor 

0-1 

Valor total de outras 

retenções 

ValTotTributos 

tsValor 

0-1 

Valor total de tributos 

ValorIss 

tsValor 

0-1 

Valor do ISS quando 

informado pelo prestador 

Aliquota 

tsAliquota 

0-1 

Alíquota do ISS quando 

informado pelo prestador 

DescontoIncondicionado 

tsValor 

0-1 

Valor do desconto 

condicionado 

DescontoCondicionado 

tsValor 

0-1 

Valor do desconto 

incondicionado 





tcValoresNfse 





Representa um conjunto de valores que compõe o documento fiscal Nome 

Tipo 

Ocorrência Descrição 

BaseCalculo 

tsValor 

1-1 

\(Valor dos serviços – Valor 

das deduções – descontos 

incondicionados\) 

Aliquota 

tsAliquota 

0-1 

Alíquota do ISS quando 

informado pelo município 

ValorIss 

tsValor 

0-1 

Valor do ISS quando 

informado pelo município 

ValorLiquidoNfse 

tsValor 

1-1 

\(ValorServicos – ValorPIS – 

ValorCOFINS – ValorINSS 

– ValorIR – ValorCSLL – 

OutrasRetençoes – 

ValorISS \(se imposto 

retido\) – 

DescontoIncondicionado – 

DescontoCondicionado\) 





37





Página 38 de 74 



Revisão 2.04 





tcDadosServico 





Representa dados que compõe o serviço prestado 





Nome 

Tipo 

Ocorrência Descrição 

Valores 

tcValoresDeclaracaoServico 

1-1 

Valor do serviço 

IssRetido 

tsSimNao 

1-1 

ISS retido \(S/N\) 

ResponsavelRetencao 

tsResponsavelRetencao 

0-1 

Responsável pela retenção 

ItemListaServico 

tsItemListaServico 

1-1 

Subitem do serviço 

prestado 

CodigoCnae 

tsCodigoCnae 

0-1 

Código CNAE 

CodigoTributacaoMunicipio 

tsCodigoTributacao 

0-1 

Código de tributação do 

município 

CodigoNbs 

tsCodigoNbs 

0-1 

Código de NBS do serviço 

Discriminacao 

tsDiscriminacao 

1-1 

Discriminação do serviço 

CodigoMunicipio 

tsCodigoMunicipioIbge 

1-1 

Código do município da 

prestação do serviço 

CodigoPais 

tsCodigoPaisIbge 

0-1 

Código do país 

ExigibilidadeISS 

tsExigibilidadeISS 

1-1 

Exigibilidade do ISS 

IdentifNaoExigibilidade 

tsIdentifNaoExigibilidade 

0-1 

Identificação da não 

exigibilidade 

MunicipioIncidencia 

tsCodigoMunicipioIbge 

0-1 

Município da incidência do 

ISS 

NumeroProcesso 

tsNumeroProcesso 

0-1 

Número do processo da 

suspensão da exigibilidade 





tcDadosConstrucaoCivil 





Representa dados para identificação de obra de engenharia e arquitetura em geral 

Nome 

Tipo 

Ocorrência Descrição 

CodigoObra 

tsCodigoObra 

1-1 

Número de identificação da 

obra 

Choice 

1-1 

Art 

tsArt 

0-1 

Número da ART 

Art 

tsArt 

1-1 

Número da ART 





tcEvento 





Representa dados para identificação do evento 





Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoEvento 

tsIdentificacaoEvento 

1-1 

Identificação do evento 

Choice 

DescricaoEvento 

tsDescricaoEvento 

0-1 

Descrição do evento 

1-1 

DescricaoEvento 

tsDescricaoEvento 

1-1 

Descrição do evento 





38





Página 39 de 74 



Revisão 2.04 





tcDadosPrestador 





Representa dados do prestador do serviço 





Nome 

Tipo 

Ocorrência Descrição 

RazaoSocial 

tsRazaoSocial 

1-1 

Razão social do prestador 

NomeFantasia 

tsNomeFantasia 

0-1 

Nome fantasia do prestador 

Endereco 

tcEndereco 

1-1 

Endereço do prestador 

Contato 

tcContato 

0-1 

Contatos do prestador 





tcIdentificacaoNfseDeducao 





Representa dados para identificação do NFS-e de dedução Nome 

Tipo 

Ocorrência Descrição 

CodigoMunicipioGerador 

tsCodigoMunicipioIbge 

1-1 

Município de geração da 

NFS-e 

NumeroNfse 

tsNumeroNfse 

1-1 

Número da NFS-e 

CodigoVerificacao 

tsCodigoVerificacao 

0-1 

Código de verificação da 

NFS-e 





tcIdentificacaoNfeDeducao 





Representa dados para identificação da NF-e de dedução Nome 

Tipo 

Ocorrência Descrição 

NumeroNfe 

tsNumeroNfe 

1-1 

Número da NF-e 

UfNfe 

tsUf 

1-1 

Estado de geração da NF-e 

ChaveAcessoNfe 

tsChaveAcessoNfe 

0-1 

Chave da NF-e 





tcOutroDocumentoDeducao 





Representa dados para identificação de d ocumento diferente de nota fiscal eletrônica 

Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoDocumento 

tsIdentificacaoDocumento 

1-1 

Identificação de documento 

diferente de NFS-e e NF-e 





tcIdentificacaoDocumentoDeducao 





Representa dados do documento da dedução do serviço prestado Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoNfse 

tcIdentificacaoNfseDeducao 

1-1 

Se o documento for NFS-e 

IdentificacaoNFe 

tcIdentificacaoNfeDeducao 

1-1 

Se o documento for NF-e 

Choice 

OutroDocumento 

tcOutroDocumentoDeducao 

1-1 

Se o documento não for as 

duas opções anteriores 





39





Página 40 de 74 



Revisão 2.04 





tcIdentificacaoFornecedor 





Representa dados para identificação do fornecedor do Brasil Nome 

Tipo 

Ocorrência Descrição 

CpfCnpj 

tcCpfCnpj 

1-1 

CNPJ ou CPF do 

fornecedor do Brasil 





tcFornecedorExterior 





Representa dados para identificação do fornecedor do exterior Nome 

Tipo 

Ocorrência Descrição 

NifFornecedor 

tsNif 

0-1 

NIF do fornecedor do 

exterior 

CodigoPais 

tsCodigoPaisIbge 

1-1 

Código do país do 

fornecedor do exterior 





tcDadosFornecedor 





Representa dados do fornecedor do exterior 





Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoFornecedor 

tcIdentificacaoFornecedor 

1-1 

Identificação do fornecedor 

do Brasil 

Choice 

FornecedorExterior 

tcFornecedorExterior 

1-1 

Identificação do fornecedor 

do exterior 





tcDadosDeducao 





Representa dados da dedução do serviço prestado 





Nome 

Tipo 

Ocorrência Descrição 

TipoDeducao 

tsTipoDeducao 

1-1 

Tipo da dedução 

DescricaoDeducao 

tsDescricaoDeducao 

0-1 

Obrigatório para 

TipoDeducao igual a “99 – 

Outras deduções” 

IdentificacaoDocumentoDeducao 

tcIdentificacaoDocumentoDeducao 

1-1 

Identificação do documento 

de dedução 

DadosFornecedor 

tcDadosFornecedor 

1-1 

Dados do fornecedor 

DataEmissao 

Date 

1-1 

Data de emissão do 

documento fiscal 

ValorDedutivel 

tsValor 

1-1 

Valor dedutível do 

documento fiscal 

ValorUtilizadoDeducao 

tsValor 

1-1 

Valor utilizado na dedução 

da NFS-e 





40





Página 41 de 74 



Revisão 2.04 





tcInfRps 





Representa dados informativos do Recibo Provisório de Serviço \(RPS\) Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoRps 

tcIdentificacaoRps 

0-1 

Número do RPS 

\(Obrigatório somente se 

declaração do prestador\) 

DataEmissao 

Date 

1-1 

Data de emissão do RPS 

Status 

tsStatusRps 

1-1 

Situação do RPS 

RpsSubstituido 

tcIdentificacaoRps 

0-1 

RPS substituído \(válido se 

RPS ainda não estiver 

convertido em NFS-e\) 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





tcInfDeclaracaoPrestacaoServico 





Representa dados do da declaração do prestador do serviço Nome 

Tipo 

Ocorrência Descrição 

Rps 

tcInfRps 

0-1 

Informações do RPS 

\(número, série, tipo, data 

de emissão e status do 

RPS\) 

Competencia 

Date 

1-1 

Data da competência do 

serviço 

Servico 

tcDadosServico 

1-1 

Dados do serviço prestado 

Prestador 

tcIdentificacaoPessoaEmpresa 

1-1 

Identificação do prestador 

do serviço 

TomadorServico 

tcDadosTomador 

0-1 

Dados do tomador do 

serviço 

Intermediario 

tcDadosIntermediario 

0-1 

Dados do intermediário 

ConstrucaoCivil 

tcDadosConstrucaoCivil 

0-1 

Dados da obra 

RegimeEspecialTributacao 

tsRegimeEspecialTributacao 

0-1 

Identificação do regime 

especial de tributação 

OptanteSimplesNacional 

tsSimNao 

1-1 

Informação se optante pelo 

Simples Nacional \(S/N\) 

IncentivoFiscal 

tsSimNao 

1-1 

Informação se o prestador 

é incentivador fiscal 

Evento 

tcEvento 

0-1 

Informação do evento 

InformacoesComplementares 

tsInformacoesComplementares 

0-1 

Informações 

complementares solicitadas 

pelo município 

Deducao 

tcDadosDeducao 

0-N 

Dados da dedução 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





41





Página 42 de 74 



Revisão 2.04 





tcDeclaracaoPrestacaoServico 





Representa a estrutura da declaração da prestação do serviço assinada Nome 

Tipo 

Ocorrência Descrição 

InfDeclaracaoPrestacaoServico 

tcInfDeclaracaoPrestacaoServico 

1-1 

Declaração do serviço 

prestado 

Signature 

dsig:Signature 

0-1 

Assinatura digital do 

prestador ou procurador 





tcIdentificacaoNfse 





Representa dados que identificam uma Nota Fiscal de Serviços Eletrônica Nome 

Tipo 

Ocorrência Descrição 

Numero 

tsNumeroNfse 

1-1 

Número da NFS-e 

CpfCnpj 

tcCpfCnpj 

1-1 

CNPJ ou CPF do prestador 

do serviço 

InscricaoMunicipal 

tsInscricaoMunicipal 

0-1 

Inscrição Municipal do 

prestador do serviço 

CodigoMunicipio 

tsCodigoMunicipioIbge 

1-1 

Código do município da 

geração da NFS-e 





tcInfNfse 





Representa os dados informativos da Nota Fiscal de Serviços Eletrônica Nome 

Tipo 

Ocorrência Descrição 

Numero 

tsNumeroNfse 

1-1 

Número da NFS-e 

CodigoVerificacao 

tsCodigoVerificacao 

1-1 

Código de verificação da 

NFS-e 

DataEmissao 

Datetime 

1-1 

Data de emissão da NFS-e 

NfseSubstituida 

tsNumeroNfse 

0-1 

Número da NFS-e 

substituída pela NFS-e 

OutrasInformacoes 

tsOutrasInformacoes 

0-1 

Outras informações 

\(preenchido pelo município\) 

ValoresNfse 

tcValoresNfse 

1-1 

Valores da NFS-e 

DescricaoCodigoTributacaoMunicípio 

tsDescricaoCodigoTributacaoMunicípio 

0-1 

Descrição do código de 

tributação do município 

ValorCredito 

tsValor 

0-1 

Valor do crédito gerado 

pela NFS-e 

PrestadorServico 

tcDadosPrestador 

1-1 

Dados do prestador do 

serviços 

OrgaoGerador 

tcIdentificacaoOrgaoGerador 

1-1 

Órgão gerador da NFS-e 

DeclaracaoPrestacaoServico 

tcDeclaracaoPrestacaoServico 

1-1 

Dentro dessa estrutura está 

o RPS, como não 

obrigatório 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





42





Página 43 de 74 



Revisão 2.04 





tcNfse 





Representa a estrutura da Nota Fiscal de Serviços Eletrônica assinada Nome 

Tipo 

Ocorrência Descrição 

InfNfse 

tcInfNfse 

1-1 

Dados da NFS-e 

Signature 

Dsig:Signature 

0-1 

Assinatura digital do 

município 

versao 

tsVersao 

1-1 





tcInfPedidoCancelamento 





Representa a estrutura de dados do pedido de cancelamento enviado pelo prestador ao cancelar uma Nota Fiscal de Serviços Eletrônica. 

Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoNfse 

tcIdentificacaoNfse 

1-1 

Identificação da NFS-e a 

ser cancelada 

CodigoCancelamento 

tsCodigoCancelamentoNfse 

1-1 

Código do cancelamento 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





tcPedidoCancelamento 





Representa a estrutura de Pedido de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada Nome 

Tipo 

Ocorrência Descrição 

InfPedidoCancelamento 

tcInfPedidoCancelamento 

1-1 

Dados do pedido do 

cancelamento da NFS-e 

Signature 

Dsig:Signature 

0-1 

Assinatura digital do 

prestador ou procurador 





tcConfirmacaoCancelamento 





Representa a estrutura de Confirmação de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada Nome 

Tipo 

Ocorrência Descrição 

Pedido 

tcPedidoCancelamento 

1-1 

Pedido de cancelamento da 

NFS-e 

DataHora 

datetime 

1-1 

Data e hora do 

cancelamento 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





tcCancelamentoNfse 





Representa a estrutura completa \(pedido \+ confirmação\) de cancelamento de NFS-e Nome 

Tipo 

Ocorrência Descrição 

Confirmacao 

tcConfirmacaoCancelamento 

1-1 

Confirmação do 

cancelamento 

Signature 

Dsig:Signature 

0-1 

Assinatura digital do 

município 

versao 

tsVersao 

1-1 





43





Página 44 de 74 



Revisão 2.04 





tcRetCancelamento 





Representa a estrutura de Confirmação de Cancelamento da Nota Fiscal de Serviços Eletrônica assinada Nome 

Tipo 

Ocorrência Descrição 

NfseCancelamento 

tcCancelamentoNfse 

1-1 

Retorno do cancelamento 

da NFS-e 





tcInfSubstituicaoNfse 





Representa os dados de registro de substituição de NFS-e. 





Nome 

Tipo 

Ocorrência Descrição 

NfseSubstituidora 

tsNumeroNfse 

1-1 

Número da NFS-e que 

substituidora 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 





tcSubstituicaoNfse 





Representa a estrutura de substituição de NFS-e. 





SubstituicaoNfse 

tcInfSubstituicaoNfse 

1-1 

Número da NFS-e que é a 

substituidora 

Signature 

dsig:Signature 

0-2 

Assinatura do prestador ou 

procurador e assinatura do 

município 

versao 

tsVersao 

1-1 

versao 





tcCompNfse 





Representa a estrutura de compartilhamento de dados de uma NFS-e. 





Nome 

Tipo 

Ocorrência Descrição 

Nfse 

tcNfse 

1-1 

Dados da NFS-e 

NfseCancelamento 

tcCancelamentoNfse 

0-1 

Dados do cancelamento 

NfseSubstituicao 

tcSubstituicaoNfse 

0-1 

Dados da substituição 





tcMensagemRetorno 





Representa a estrutura de mensagem de retorno de serviço. 





Nome 

Tipo 

Ocorrência Descrição 

Codigo 

tsCodigoMensagemAlerta 

1-1 

Código da mensagem de 

alerta 

Mensagem 

tsDescricaoMensagemAlerta 

1-1 

Descrição da mensagem 

de alerta 

Correcao 

tsDescricaoMensagemAlerta 

0-1 

Descrição dos 

procedimentos para a 

correção da NFS-e 





44





Página 45 de 74 



Revisão 2.04 





tcMensagemRetornoLote 





Representa a estrutura de mensagem de retorno de serviço. 





Nome 

Tipo 

Ocorrência Descrição 

IdentificacaoRps 

tcIdentificacaoRps 

1-1 

Identificação do RPS 

Codigo 

tsCodigoMensagemAlerta 

1-1 

Código da mensagem de 

erro 

Mensagem 

tsDescricaoMensagemAlerta 

1-1 

Descrição da mensagem 

do erro 





tcLoteRps 





Representa a estrutura do lote de RPS para fila de processamento Nome 

Tipo 

Ocorrência Descrição 

NumeroLote 

tsNumeroLote 

1-1 

Número do lote informado 

pelo prestador 

Prestador 

tcIdentificacaoPessoaEmpresa 

1-1 

CNPJ ou CPF do prestador 

/ Inscrição municipal do 

prestador 

QuantidadeRps 

tsQuantidadeRps 

1-1 

Quantidade de RPS 

contidas no lote 

ListaRps 



1-1 

Lista de RPS 

Rps 

tcDeclaracaoPrestacaoServico 

1-N 

Dados dos RPSs 

Id 

tsIdTag 



Identificador da TAG a ser 

assinada 

versao 

tsVersao 

1-1 





ListaMensagemRetornoLote 





Representa a estrutura de mensagem de retorno de serviço. 





Nome 

Tipo 

Ocorrência Descrição 

MensagemRetorno 

tcMensagemRetornoLote 

1-N 

Mensagens de retorno do 

lote 





ListaMensagemRetorno 





Representa a estrutura de mensagem de retorno de serviço. 





Nome 

Tipo 

Ocorrência Descrição 

MensagemRetorno 

tcMensagemRetorno 

1-N 

Mensagens de retorno do 

lote 





ListaMensagemAlertaRetorno 





Representa a estrutura de mensagem de retorno de serviço. 





Nome 

Tipo 

Ocorrência Descrição 

MensagemRetorno 

tcMensagemRetorno 

1-N 

Mensagens de erros e 

alertas 





45





Página 46 de 74 



Revisão 2.04 





cabecalho 





Representa a estrutura do cabeçalho 





Nome 

Tipo 

Ocorrência Descrição 

versaoDados 

tsVersao 

1-1 



versao 

tsVersao 





CompNfse 





Representa a estrutura da NFS-e. 





Nome 

Tipo 

Ocorrência Descrição 

CompNfse 

tcCompNfse 

1-1 





46





Página 47 de 74 



Revisão 2.04 





9 ESTRUTURA DE DADOS DO WEB SERVICE 

Existirá um único Web Service com todos os serviços apresentados no item 7.1. O fluxo de comunicação é sempre iniciado pelo sistema do contribuinte com o envio de uma mensagem XML ao Web Service com o pedido do serviço desejado. 

## 9.1 Modelo Operacional 

A forma de processamento das solicitações de serviços no projeto Nota Fiscal de Serviços Eletrônica pode ser síncrona, caso o atendimento da solicitação de serviço seja realizado na mesma conexão ou assíncrona, quando o processamento do serviço solicitado não é atendido na mesma conexão, devido a uma demanda de processamento de grande quantidade de informação. Nessa situação torna-se necessária a realização de mais uma conexão para a obtenção do resultado do processamento. 

As solicitações de serviços que exigem processamento intenso serão executadas de forma assíncrona e as demais solicitações de serviços de forma síncrona. 

Assim, os serviços da NFS-e serão implementados da seguinte forma: Serviço 

Implementação 

Recepção e Processamento de Lote de RPS 

Assíncrona 

Enviar Lote de RPS Síncrono 

Síncrona 

Geração de NFS-e 

Síncrona 

Cancelamento de NFS-e 

Síncrona 

Substituição de NFS-e 

Síncrona 

Consulta de Lote de RPS 

Síncrona 

Consulta de NFS-e por RPS 

Síncrona 

Consulta de NFS-e – Serviços Prestados 

Síncrona 

Consulta de NFS-e – Serviços Tomados ou Intermediados Síncrona 

Consulta de NFS-e por faixa 

Síncrona 

9.1.1 Serviços Síncronos 

As solicitações de serviços de implementação síncrona são processadas imediatamente e o resultado do processamento é obtido em uma única conexão. 

Fluxo simplificado de funcionamento: 

Etapas do processo ideal: 

1. O aplicativo do contribuinte inicia a conexão enviando uma mensagem de solicitação de serviço para o Web Service; 



47





Página 48 de 74 



Revisão 2.04 





2. O Web Service recebe a mensagem de solicitação de serviço e encaminha ao aplicativo da NFS-e que irá processar o serviço solicitado; 3. O aplicativo da NFS-e recebe a mensagem de solicitação de serviços e realiza o processamento, devolvendo uma mensagem de resultado do processamento ao Web Service; 

4. O Web Service recebe a mensagem de resultado do processamento e o encaminha ao aplicativo do contribuinte; 

5. O aplicativo do contribuinte recebe a mensagem de resultado do processamento e caso não exista outra mensagem, encerra a conexão. 

9.1.2 Serviços Assíncronos 

As solicitações de serviços de implementação assíncrona são processadas de forma distribuída por vários processos e o resultado do processamento somente é obtido na segunda conexão. 

Fluxo simplificado de funcionamento: 



Prestador 

Administração Tributária Municipal 



<XML> 



Solicitação 





Web Service 



<XML> 

Fila de Processos 



Resultado 

Etapas do processo ideal: 

Solicitação e processamento: 

1. O aplicativo do contribuinte inicia a conexão enviando uma mensagem de solicitação de serviço para o Web Service de recepção de solicitação de serviços; 2. O Web Service de recepção de solicitação de serviços recebe a mensagem de solicitação de serviço e a coloca na fila de serviços solicitados, acrescentando o CNPJ ou CPF do transmissor obtido do certificado digital do transmissor; 3. O Web Service de recepção de solicitação de serviços retorna o protocolo da solicitação de serviço e a data e hora de gravação na fila de serviços solicitados ao aplicativo do contribuinte; 

4. O aplicativo do contribuinte recebe o protocolo; 5. Na estrutura interna do aplicativo de NFS-e a solicitação de serviços é retirada da fila de serviços solicitados pelo aplicativo da NFS-e em momento específico, definido pela equipe técnica da NFS-e; 

6. O serviço solicitado é processado pelo aplicativo da NFS-e e o resultado do processamento é colocado na fila de serviços processados; 48





Página 49 de 74 



Revisão 2.04 





Administração Tributária Municipal 

Prestador 

<XML> 

Web Services 

Solicitação 

Processamento 

<XML> 

Resultado 



Obtenção do resultado do serviço: 

1. O aplicativo do contribuinte, utilizando o protocolo recebido, envia uma consulta ao serviço que retornará o resultado do processamento daquele protocolo, iniciando uma conexão com o Web Service; 

2. O Web Service recebe a mensagem de consulta e localiza o resultado de processamento da solicitação de serviço; 

3. O Web Service devolve o resultado do processamento ao aplicativo contribuinte; 4. O aplicativo do contribuinte recebe a mensagem de resultado do processamento e, caso não exista outra mensagem, encerra a conexão. 

## 9.2 Detalhamento dos serviços 

A seguir estão os serviços relacionados disponíveis, conforme descritos no item 7.1, no WebService e seus XML Schema. O XML Schema define a estrutura e formatação do arquivo XML que conterá os dados a serem trafegados. Esses documentos serão enviados de forma textual \(como uma string\) como parâmetros do serviço oferecido pelo Web Service, como descrito em 7.3.1. 

As tabelas que detalham cada XML Schema estão divididas da seguinte forma: \(1\) 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

\(2\) 

\(3\) 

\(4\) 

\(5\) 

\(6\) 

\(7\) 





\(8\) 

\(9\) 





Legenda da tabela: 

\(1\) Elemento 

\(2\) Número identificador do campo, quando este contiver subitens; \(3\) Nome do campo; 

\(4\) Nome do tipo do campo que pode ser do tipo primitivo, simples ou complexo; \(5\) Indica qual é o campo pai, para definição da hierarquia; \(6\) Quantas vezes o campo se repete na estrutura de dados: a. Formato: “z-y” onde “x” é a quantidade mínima e “y” a quantidade máxima. Se a quantidade máxima for indefinida, será utilizado “N” no lugar do “y”; \(7\) Descreve alguma observação pertinente; 

\(8\) Formato de grupo, utilizado para definição de uma escolha \(ver próximo item\); \(9\) Identifica os campos ou grupos que farão parte de uma escolha \(Choice\). 



49





Página 50 de 74 



Revisão 2.04 





9.2.1 Recepção de Lote de RPS 

Esse serviço será executado, pelo o método RecepcionarLoteRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

EnviarLoteRpsEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

EnviarLoteRpsEnvio 





LoteRps 

tcLoteRps 

1 

1-1 





Signature 

dsig:Signature 

1 

0-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

EnviarLoteRpsResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

EnviarLoteRpsResposta 





1-1 





NumeroLote 

tsNumeroLote 

1 





DataRecebimento 

Datetime 

1 

1-1 



Choice 



Protocolo 

tsNumeroProtocolo 

1 

2 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 



O lote será processado posteriormente, sendo o seu resultado disponibilizado para consulta. 

9.2.2 Enviar Lote de RPS Síncrono 

Esse serviço será executado, inicialmente, pelo método RecepcionarLoteRpsSincrono, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

EnviarLoteRpsSincronoEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

EnviarLoteRpsSincronoEnvio 





1-1 





LoteRps 

tcLoteRps 

1 

1-1 





Signature 

dsig:Signature 

1 

0-1 





50





Página 51 de 74 



Revisão 2.04 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

EnviarLoteRpsSincronoResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

EnviarLoteRpsSincronoRespost





1-1 



a 



NumeroLote 

tsNumeroLote 

1 

0-1 





DataRecebimento 

Datetime 

1 

0-1 





Protocolo 

tsNumeroProtocolo 

1 

0-1 



2 

ListaNfse 

ListaNfse 

1 

1-1 



CompNfse 

CompNfse 

2 

1-N 



ListaMensagemAlertaRetorno 

ListaMensagemAlertaRetorno 

2 

0-1 

Choice 

3 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

4 

ListaMensagemRetornoLote 

ListaMensagemRetornoLote 

1 

1-1 

9.2.3 Geração de NFS-e 

Esse serviço será executado, inicialmente, pelo método GerarNfse, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

GerarNfseEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

GerarNfseEnvio 





1-1 





RPS 

tcDeclaracaoPrestacaoServico 

1 

1-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

GerarNfseResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

GerarNfseResposta 





1-1 



2 

ListaNfse 

ListaNfse 

1 

0-1 





CompNfse 

CompNfse 

2 

1-1 

Choice 



ListaMensagemAlertaRetorno 

ListaMensagemAlertaRetorno 

2 

0-1 



2 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 





51





Página 52 de 74 



Revisão 2.04 





9.2.4 Cancelamento NFS-e 

Esse serviço será executado através da chamada ao método CancelarNfse, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

CancelarNfseEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

CancelarNfseEnvio 





1-1 





Pedido 

tcPedidoCancelamento 

1 

1-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

CancelarNfseResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

CancelarNfseResposta 





RetCancelamento 

tcRetCancelamento 

1 

1-1 

Choice 



ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

9.2.5 Substituição NFS-e 

Esse serviço será executado pelo método SubstituirNfse, passando a mensagem XML 

como parâmetro com a estrutura definida na tabela que segue. 

SubstituirNfseEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

SubstituirNfseEnvio 





2 

SubstituicaoNfse 



1 

1-1 





Pedido 

tcPedidoCancelamento 

2 

1-1 





Rps 

tcDeclaracaoPrestacaoServico 

2 

1-1 





Id 

tsIdTag 

2 

0-1 





Signature 

dsig:Signature 

1 

0-1 





52





Página 53 de 74 



Revisão 2.04 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 



SubstituirNfseResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

SubstutuirNfseResposta 





2 

RetSubstituicao 



1 

1-1 





3 

NfseSubstituida 



2 

1-1 





CompNfse 

CompNfse 

3 

1-1 

Choice 



ListaMensagemAlertaRetorno 

ListaMensagemAlertaRetorno 

3 

0-1 

4 

NfseSubstituidora 



2 

1-1 



CompNfse 

CompNfse 

4 

1-1 

5 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

9.2.6 Consulta de Lote de RPS 

Esse serviço será executado pelo método ConsultarLoteRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

ConsultarLoteRpsEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarLoteRpsEnvio 





1-1 





Prestador 

tcIdentificacaoPessoaEmpresa 

1 

1-1 





Protocolo 

tsNumeroProtocolo 

1 

1-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

ConsultarLoteRpsResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarLoteRpsResposta 





1-1 



2 

Situação 

tsSituacaoLoteRps 

1 

1-1 



3 

ListaNfse 

ListaNfse 

1 

1-1 



CompNfse 

CompNfse 

3 

1-N 



ListaMensagemAlertaRetorno 

ListaMensagemAlertaRetorno 

3 

0-1 

Choice 

4 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

5 

ListaMensagemRetornoLote 

ListaMensagemRetornoLote 

1 

1-1 





53





Página 54 de 74 



Revisão 2.04 





9.2.7 Consulta de NFS-e por RPS 

Esse serviço será executado pelo método ConsultarNfsePorRps, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

ConsultarNfseRpsEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarNfseRpsEnvio 





IdentificacaoRps 

tcIdentificacaoRps 

1 

1-1 





Prestador 

tcIdentificacaoPessoaEmpresa 

1 

1-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

ConsultarNfseRpsResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

ConsultarNfseRpsResposta 





CompNfse 

CompNfse 

1 

1-1 

Choice 

2 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

9.2.8 Consulta de NFS-e – Serviços Prestados 

Esse serviço será executado pelo método ConsultarNfseServicoPrestado, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

ConsultarNfseServicoPrestadoEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarNfseEnvio 





1-1 





Prestador 

tcIdentificacaoPessoaEmpresa 

1 

1-1 



2 

NumeroNfse 

tsNumeroNfse 

1 

1-1 



3 

PeriodoEmissao 



1 

1-1 





DataInicial 

date 

3 

1-1 





DataFinal 

date 

3 

1-1 

Choice 

4 

PeriodoCompetencia 



1 

1-1 





DataInicial 

date 

4 

1-1 





DataFinal 

date 

4 

1-1 





Tomador 

tcIdentificacaoPessoaEmpresa 

1 

0-1 





Intermediario 

tcIdentificacaoPessoaEmpresa 

1 

0-1 



5 

Pagina 

tsPagina 

1 

1-1 





54





Página 55 de 74 



Revisão 2.04 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

ConsultarNfseServicoPrestadoResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarNfseResposta 





1-1 



2 

ListaNfse 



1 

1-1 



CompNfse 

CompNfse 

2 

1-50 

Choice 



Pagina 

tsPagina 

2 

1-1 

3 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

9.2.9 Consulta de NFS-e – Serviços Tomados ou Intermediados Esse serviço será executado pelo método ConsultarNfseServicoTomado, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

Observação: 

1. A identificação do Tomador ou a identificação do Intermediário deve ser igual à identificação do Consulente 

2. A identificação do Tomador ou a identificação do Intermediário deve ser informada ConsultarNfseServicoTomadoEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência Observação 

1 

ConsultarNfseEnvio 





1-1 





Consulente 

tcIdentificacaoPessoaEmpresa 

1 

1-1 



2 

NumeroNfse 

tsNumeroNfse 

1 

1-1 



3 

PeriodoEmissao 



1 

1-1 





DataInicial 

date 

3 

1-1 





DataFinal 

date 

3 

1-1 

Choice 

4 

PeriodoCompetencia 



1 

1-1 





DataInicial 

date 

4 

1-1 





DataFinal 

date 

4 

1-1 





Prestador 

tcIdentificacaoPessoaEmpresa 

1 

11 





Tomador 

tcIdentificacaoPessoaEmpresa 

1 

0-1 





Intermediario 

tcIdentificacaoPessoaEmpresa 

1 

0-1 



5 

Pagina 

tsPagina 

1 

1-1 





55





Página 56 de 74 



Revisão 2.04 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

ConsultarNfseServicoTomadoResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

ConsultarNfseResposta 





1-1 



2 

ListaNfse 



1 

1-1 



CompNfse 

CompNfse 

2 

1-50 

Choice 



Pagina 

tsPagina 

2 

1-1 

3 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 

9.2.10 Consulta de NFS-e por faixa 

Esse serviço será executado pelo método ConsultarNfseFaixa, passando a mensagem XML como parâmetro com a estrutura definida na tabela que segue. 

ConsultarNfseFaixaEnvio 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

ConsultarNfseFaixaEnvio 





1-1 





Prestador 

tcIdentificacaoPessoaEmpresa 

1 

1-1 



2 

Faixa 



1 

1-1 





NumeroNfseInicial 

tsNumeroNfse 

2 

1-1 





NumeroNfseFinal 

tsNumeroNfse 

2 

1-1 



3 

Pagina 

tsPagina 

1 

1-1 





Em resposta a chamada do serviço será devolvida a estrutura definida na tabela a seguir. 

ConsultarNfseFaixaResposta 

\# 

Nome 

Tipo 

Pai 

Ocorrência 

Observação 

1 

ConsultarNfseFaixaResposta 





1-1 



2 

ListaNfse 



1 

1-1 



CompNfse 

CompNfse 

2 

1-50 

Choice 



Pagina 

tsPagina 

2 

1-1 

3 

ListaMensagemRetorno 

ListaMensagemRetorno 

1 

1-1 





56





Página 57 de 74 



Revisão 2.04 





10 ESTRUTURAS DE DADOS 

Embora outras estruturas de requisição e retorno de mensagens existam, nos limitaremos às principais. As principais estruturas do sistema são as da NFS-e e do RPS. 

## 10.1 Legenda 

### INFORMAÇÃO 

IDENTIFICAÇÃO DA INFORMAÇÃO 

\# 

\# 

Número do item e seus desdobramentos \(pai/filhos\) PAI 

Tag Pai 

Número da tag pai 

TAG 

Nome Tag 

Nome da tag no schema xml 

DESCRIÇÃO 

Descrição 

Breve descrição a respeito da identificação da informação. 

OC 

Ocorrência 

Número de vezes que a informação pode ser apresentada. 

Tip 

Tipo 

Tipos de dados: 

N – Numérico 

C – Caracteres 

DT – Data/Hora 

D – Data 

Tam 

Tamanho 

Quantidade máxima de caracteres ou precisão numérica, dependendo do tipo de informação. 

Dec 

Decimais 

Quantidade máxima de decimais. 

## 10.2 Nota Fiscal de Serviços Eletrônica 

\# 

TAG 





DESCRIÇÃO 

PAI 

CONSOL. 

A 

NOTA FISCAL DE SERVIÇOS ELETRÔNICA 





\(INFORMAÇÕES GERADAS PELA ADMINISTRAÇÃO TRIBUTÁRIA MUNICIPAL\) 

Nfse 

A-1 

INFORMAÇÕES DA NFS-e \(InfNfse\) 

A 

Oc Tip Tam 

Dec 

A-2 

Numero 

Número da NFS-e, formado por um 

A-1 

1-1 

N 

15 



número sequencial com 15 posições 

A-3 

CodigoVerificacao 

Código da Verificação da NFS-e – 

A-1 

1-1 

C 

9 



Composto somente de números e/ou 

letras \(exceto “ç” e letras acentuadas\) 

A-4 

DataEmissao 

Data/Hora da emissão da NFS-e \(AAAA-

A-1 

1-1 DT 

0 



MM-DDTHH:mm:ss\) 

A-5 

NfseSubstituida 

Número da NFS-e substituída. 

A-1 

0-1 

N 

15 



A-6 

OutrasInformacoes 

Uso 

da 

Administração 

Tributária 

A-1 

0-1 

C 

510 



Municipal 





A-7 

VALORES DA NFS-e \(ValoresNfse\) 

A-1 

Oc Tip Tam 

Dec 

A-8 

BaseCalculo 

\(ValorServicos – ValorDeducoes – 

A-7 

0-1 

N 

15 

2 

DescontoIncondicionado\) 

A-9 

Aliquota 

Alíquota do serviço prestado. 

A-7 

0-1 

N 

4 

2 



57





Página 58 de 74 



Revisão 2.04 





A-10 

ValorIss 

Valor do ISS devido em R$ 

A-7 

0-1 

N 

15 

2 

A-11 

ValorLiquidoNfse 

\(ValorServicos - ValorPIS – ValorCOFINS 

A-7 

0-1 

N 

15 

2 

– ValorINSS – ValorIR – ValorCSLL – 

OutrasRetençoes – ValorISS \(se imposto 

retido\) – DescontoIncondicionado – 

DescontoCondicionado\) 





A-12 

DescricaoCodigoTributacaoMunic Descrição do código de tributação do A-1 

0-1 

C 

1000 



ípio 

município. 

A-13 

ValorCredito 

Valor do crédito gerado. 

A-1 

0-1 

N 

5,2 

2 





A-14 

COMPLEMENTO DA IDENTIFICAÇÃO DO PRESTADOR DO SERVIÇO 

A-1 





\(PrestadorServico\) 

14 

IDENTIFICAÇÃO COMPLEMENTAR DO PRESTADOR \(DadosPrestador\) A-14 

Oc Tip Tam 

Dec 

A-15 

RazaoSocial 

Razão Social do prestador do serviço 

A-15 

1-1 

C 

150 



A-16 

NomeFantasia 

Nome Fantasia do prestador do serviço 

A-15 

0-1 

C 

60 



A-17 

ENDEREÇO DO PRESTADOR \(Endereco\) 

A-15 

1-1 





A-18 

Endereco 

Tipo e nome do logradouro do 

A-17 

1-1 

C 

125 



estabelecimento do prestador do serviço 

A-19 

Numero 

Número do imóvel do estabelecimento do 

A-17 

1-1 

C 

60 



prestador do serviço 

A-20 

Complemento 

Complemento 

do 

endereço 

do 

A-17 

0-1 

C 

60 



estabelecimento do prestador do serviço 

A-21 

Bairro 

Bairro do estabelecimento do prestador 

A-17 

1-1 

C 

60 



do serviço 

A-22 

CodigoMunicipio 

Código do município do estabelecimento 

A-17 

1-1 

N 

7 



do prestador do serviço \(Tabela do IBGE\) 

A-23 

Uf 

Sigla da unidade da federação do 

A-17 

1-1 

C 

2 



estabelecimento do prestador do serviço 

A-24 

Cep 

Número do CEP do estabelecimento do 

A-17 

1-1 

C 

8 



prestador do serviço 

A-26 

CONTATO DO PRESTADOR \(Contato\) 

A-14 

0-1 





A-27 

Telefone 

Número do telefone do prestador 

A-26 

0-1 

C 

20 



A-28 

Email 

E-mail do prestador 

A-26 

0-1 

C 

80 





A-29 

IDENTIFICAÇÃO DO ÓRGÃO GERADOR \(OrgaoGerador\) 

A-1 

Oc Tip Tam 

Dec 

A-30 

CodigodoMunicipio 

Código do IBGE do município gerador da 

A-29 

1-1 

N 

7 



NFS-e 

A-31 

Uf 

Sigla da unidade da federação do 

A-29 

1-1 

C 

2 



município gerador da NFS-e 





B 

DECLARAÇÃO DA PRESTAÇÃO DO SERVIÇO 

A-1 





\(INFORMAÇÕES GERADAS PELO PRESTADOR DE SERVIÇOS\) \(DeclaracaoPrestacaoServico\) 

B-1 

INFORMAÇÕES DECLARAÇÃO DA PRESTAÇÃO DO SERVIÇO 

B 





\(InfDeclaracaoPrestacaoServico\) 

B-2 

RPS \(Rps\) 



B-1 

Oc 

Tip Tam 

Dec 



58





Página 59 de 74 



Revisão 2.04 





B-3 

IdentificacaoRps 



B-2 

0-1 





B-4 

Numero 

Número do RPS 

B-3 

1-1 

N 

15 



B-5 

Serie 

Número do equipamento emissor do RPS 

1-1 

C 

5 



B-3 

ou série do RPS 

B-6 

Tipo 

Tipo do RPS 

1-1 

N 

1 



1 – Recibo Provisório de Serviços; 

2 – RPS Nota Fiscal Conjugada 

B-3 

\(Mista\); 

3 – Cupom. 

B-7 

DataEmissaoRps 

Dia, mês e ano da prestação de serviço 

B-2 

1-1 

D 

0 



\(AAAAMMDD\) 



B-8 

Status 

Situação do RPS 

B-2 

1-1 

N 

1 



1 – Normal; 



2 – Cancelado. 



B-9 

IDENTIFICAÇÃO DO RPS SUBSTITUÍDO \(RpsSubstituido\) B-2 

0-1 





B-10 

Numero 

Número do RPS 

B-9 

1-1 

N 

15 



B-11 

Serie 

Número do equipamento emissor do RPS 

1-1 

C 

5 



B-9 

ou série do RPS 

B-12 

Tipo 

Tipo do RPS 

1-1 

N 

1 



1 – Recibo Provisório de Serviços; 

2 – RPS Nota Fiscal Conjugada 

B-9 

\(Mista\); 

3 – Cupom. 





IDENTIFICAÇÃO DA PRESTAÇÃO DO SERVIÇO 



Oc Tip Tam 

Dec 

B-13 

Competencia 

Dia, mês e ano da prestação de serviço 

B-1 

1-1 

D 

0 



\(AAAAMMDD\) 

B-14 

Servico 

Detalhamento do serviço prestado 

B-1 

1-1 





B-15 

Valores 

Valores referentes ao serviço prestado 

B-14 

1-1 





B-16 

ValorServicos 

Valor dos serviços em R$ 

B-15 

1-1 

N 

15 

2 

B-17 

ValorDeducoes 

Valor das deduções para Redução da 

B-15 

0-1 

N 

15 

2 

Base de Cálculo em R$ 

B-18 

ValorPis 

Valor da retenção do PIS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-19 

ValorCofins 

Valor da retenção do COFINS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-20 

ValorInss 

Valor da retenção do INSS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-21 

ValorIr 

Valor da retenção do IR em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-22 

ValorCsll 

Valor da retenção do CSLL em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-23 

OutrasRetencoes 

Outras retenções na Fonte. Informação 

B-15 

0-1 

N 

15 

2 

declaratória 

B-24 

ValTotTributos 

Valor total aproximado dos tributos 

B-15 

0-1 

N 

15 

2 

federais, estaduais e municipais, em 

conformidade com o artigo 1o da Lei no 

12.741/2012 

B-25 

ValorIss 

Valor do ISS devido em R$ 

B-15 

0-1 

N 

15 

2 

B-26 

Alíquota 

Alíquota do serviço prestado 

B-15 

0-1 

N 

4 

2 



59





Página 60 de 74 



Revisão 2.04 





B-27 

DescontoIncondicionado 

Valor do desconto incondicionado 

B-15 

0-1 

N 

15 

2 

B-28 

DescontoCondicionado 

Valor do desconto condicionado 

B-15 

0-1 

N 

15 

2 

B-29 

IssRetido 

ISS é retido na fonte 

B-14 

1-1 

N 

1 



1 – Sim; 



2 – Não. 



B-30 

ResponsavelRetencao 

Informado somente se IssRetido igual a 

B-14 

0-1 

N 

1 



“1 – Sim” 



A opção “2 – Intermediário” somente 

poderá ser selecionada se 

“CpfCnpjIntermediario” informado. 

1 – Tomador; 

2 – Intermediário. 

B-31 

ItemListaServico 

Subitemdo serviço prestado conforme 

B-14 

1-1 

C 

5 



LC 116/2003 

B-32 

CodigoCnae 

CNAE 

B-14 

0-1 

N 

7 



B-33 

CodigoTributacaoMunicípio 

Código do serviço prestado próprio do 

B-14 

0-1 

C 

20 



município 

B-34 

CodigoNbs 

Código NBS 

B-14 

0-1 

C 

9 



B-35 

Discriminacao 

Discriminação dos serviços 

B-14 

1-1 

C 

2000 



B-36 

CodigoMunicipio 

Código do município onde o serviço foi 

B-14 

1-1 

N 

7 



prestado \(tabela do IBGE\), se exterior 

colocar 9999999 

B-37 

CodigoPais 

Código do país onde o serviço foi 

B-14 

0-1 

N 

4 



prestado \(Tabela de país do IBGE\). 

Preencher somente se 

MunicipioPrestacaoServico igual 

9999999 

B-38 

ExigibilidadeISS 

Exigibilidades possíveis 

B-14 

1-1 

N 

2 



1 – Exigível; 

2 – Não incidência; 

3 – Isenção; 

4 – Exportação; 

5 – Imunidade; 

6 – Exigibilidade Suspensa por 

Decisão Judicial; 

7 – Exigibilidade Suspensa por 

Processo Administrativo. 

B-39 

IdentifNaoExigibilidade 

Identificação da não exigibilidade do 

B-14 

0-1 

C 

4 



ISSQN – somente para os casos de 

benefício fiscal 

B-40 

MunicipioIncidencia 

Código do município onde é a incidência 

B-14 

0-1 

N 

7 



do imposto \(Tabela do IBGE\) 

B-41 

NumeroProcesso 

Número do processo judicial ou 

B-14 

0-1 

C 

30 



administrativo de suspensão da 

exigibilidade. Obrigatório e informado 

somente quando declarada a suspensão 

da exigibilidade do tributo 





B-41 

IDENTIFICAÇÃO DO PRESTADOR \(Prestador\) 

B-1 

1-1 





B-42 

CPF OU CNPJ DO PRESTADOR \(CpfCnpj\) 

B-41 

1-1 





B-43 

O Cpf 

Número do CPF do prestador do serviço 

B-42 

1-1 

C 

11 



U Cnpj 

Número do CNPJ do prestador do serviço 

B-42 

1-1 

C 

14 



B-44 

InscricaoMunicipal 

Número de inscrição municipal do 

B-41 

0-1 

C 

15 



prestador de serviço 



60





Página 61 de 74 



Revisão 2.04 





B-45 

IDENTIFICAÇÃO DO TOMADOR DO SERVIÇO \(TomadorServico\) B-1 

0-1 





B-46 

IDENTIFICAÇÃO DO TOMADOR \(IdentificacaoTomador\) 

B-45 

0-1 





B-47 

CPF OU CNPJ DO TOMADOR 



B-46 

0-1 





\(CpfCnpj\) 

B-48 

O Cpf 

Número do CPF do tomador do serviço 

B-47 

1-1 

C 

11 



U Cnpj 

Número do CNPJ do tomador do serviço 

B-47 

1-1 

C 

14 



B-49 

InscricaoMunicipal 

Número de inscrição municipal do 

B-46 

0-1 

C 

15 



tomador de serviço 

B-50 

NifTomador 

Este elemento só deverá ser preenchido 

B-45 

0-1 

C 

40 



para tomadores não residentes no Brasil 

B-51 

RazaoSocial 

Nome / Razão Social do tomador. 

B-45 

1-1 

C 

150 





\# 





Oc Tip Tam 

Dec 

B-52 



B-52a ENDEREÇO DO TOMADOR \(Endereco\) 

B-45 

1-1 





B-52b Endereco 

Tipo e nome do logradouro do tomador B-52a 1-1 

C 

255 



do serviço 



B-52c Numero 

Número do imóvel do tomador do serviço 

B-52a 

1-1 

C 

60 





B-52d Complemento 

Complemento do endereço do tomador B-52a 

0-1 

C 

60 



do serviço 



B-52e Bairro 

Bairro do tomador do serviço 

B-52a 

1-1 

C 

60 





B-52f CodigoMunicipio 

Código do município do tomador do B-52a 

1-1 

N 

7 



serviço \(Tabela do IBGE\) 



O B-52g Uf 

Sigla da unidade da federação do B-52a 

1-1 

C 

2 



U 

tomador do serviço 



B-52h Cep 

Número do CEP do tomador do serviço 

B-52a 

1-1 

C 

8 





B-52i ENDEREÇO DO TOMADOR DO EXTERIOR 

B-45 

1-1 





\(EnderecoExterior\) 



B-52j CodigoPais 

Código do país do tomador do serviço 

B-52i 

1-1 

N 

4 



\(Tabela do de país do IBGE\). 



B-52k EnderecoCompletoEx Descrição completa do endereço do B-52i 

1-1 

C 

255 



terior 

exterior 

B-53 

CONTATO DO TOMADOR \(Contato\) 

B-45 

0-1 





B-54 

Telefone 

Número do telefone do tomador 

B-53 

0-1 

C 

20 



B-55 

Email 

E-mail do tomador 

B-53 

0-1 

C 

80 





B-56 

DADOS DO INTERMEDIÁRIO 

B-1 

Oc Tip Tam 

Dec 

B-57 

IDENTIFICAÇÃO DO INTERMEDIÁRIO \(IdentificacaoIntermediario\) B-56 

0-1 





B-58 

CPF OU CNPJ DO INTERMEDIÁRIO \(CpfCnpj\) 

B-57 

1-1 





B-59 

Cpf 

Número do CPF do intermediário do 

B-58 

1-1 

C 

11 



O

serviço 

U Cnpj 

Número do CNPJ do intermediário do 

B-58 

1-1 

C 

14 



serviço 

B-60 

InscricaoMunicipal 

Número de inscrição municipal do 

B-57 

0-1 

C 

15 



intermediário de serviço 





61





Página 62 de 74 



Revisão 2.04 





B-61 

RazaoSocial 

Nome ou Razão Social de intermediário 

B-56 

0-1 

C 

150 



do serviço 

B-62 

CodigoMunicipio 

Código do município onde o intermediário 

B-56 

0-1 

N 

7 



está estabelecido \(Tabela do IBGE\) 





DETALHAMENTO ESPECÍFICO DE OBRA DE ENGENHARIA E 



Oc Tip Tam 

Dec 

ARQUITETURA EM GERAL 

B-63 

OBRA DE ENGENHARIA E ARQUITETURA EM GERAL\(ConstrucaoCivil\) B-1 

0-1 





B-64 

CodigodaObra 

Número de identificação da obra 

B-63 

0-1 

C 

30 



B-65 

Art 

Número da ART 

B-63 

0-1 

C 

30 





B-66 

RegimeEspecialTributacao 

Tipos de Regimes especiais: 

B-1 

0-1 

N 

2 



1 – Microempresa Municipal; 

2 – Estimativa; 

3 – Sociedade de Profissionais; 

4 – Cooperativa; 

5 – Microempresário Individual \(MEI\); 

6 – Microempresa ou Empresa de 

Pequeno Porte \(ME EPP\). 

B-67 

OptanteSimplesNacional 

Prestador é optante pelo Simples 

B-1 

1-1 

N 

1 



Nacional: 

1 – Sim; 

2 – Não . 

B-68 

IncentivoFiscal 

Prestador possui Incentivo Fiscal: 

B-1 

1-1 

N 

1 



1 – Sim; 



2 – Não. 





B-69 

EVENTO \(Evento\) 

B-1 

0-1 





B-70 

IdentificacaoEvento 

Identificação do evento \(Obrigatório se 

B-69 

0-1 

C 

30 



DescricaoEvento não informado\) 

B-71 

DescricaoEvento 

Descrição do evento \(Obrigatório se 

B-69 

0-1 

C 

255 



IdentificacaoEvento não informado\) 





B-72 

InformacoesComplementares 

Informações complementares para uso 

B-1 

0-1 

C 

## 2.000 

### do prestador de serviços conforme 

regulamento do município, preenchido no 

padrão JSON 





B-73 

DEDUÇÃO \(Deducao\) 



B-1 

0-N 





TipoDeducao 

Identificação da dedução 

B-73 

1-1 

N 

2 



1 – Materiais; 

2 – Subempreitada de mão de 

obra; 

3 – Serviços; 

4 – Produção externa; 

5 – Alimentação e bebidas/frigobar; 

6 – Reembolso de despesas; 

7 – Repasse consorciado; 

8 – Repasse plano de saúde 

99 – Outras deduções 

B-74 

DescricaoDeducao 

Informar o tipo da dedução no caso da 

B-73 

0-1 

C 

150 



opção 99 – Outras Deduções 

B-75 

DOCUMENTO DA DEDUÇÃO \(IdentificacaoDocumentoDeducao\) B-74 

1-1 





62





Página 63 de 74 



Revisão 2.04 





\# 





Oc Tip Tam 

Dec 

B-76 

B-76a IdentificacaoNfse 

B-75 

1-1 





B-76b CodigoMunicipioGera Código do IBGE do Município gerador da B-76a 1-1 

N 

7 





dor 

NFS-e 



B-76c NumeroNfse 

Número da NFS-e 

B-76a 

1-1 

N 

15 





B-76d CodigoVerificacao 

Código de Verificação da NFS-e 

B-76a 

0-1 

C 

9 





B-76e IdentificacaoNFe \( 

B-75 

1-1 





O B-76f NumeroNfe 

Número da NF-e 

B-76e 

1-1 

N 

9 



U 



B-76g UfNfe 

Unidade da Federação da NF-e 

B-76e 

1-1 

C 

2 





B-76h ChaveAcessoNfe 

Chave de acesso da NF-e 

B-76e 

0-1 

N 

44 





B-76i OutroDocumento 

B-75 

1-1 





B-76j IdentificacaoDocume

Número de documento fiscal diferente de 

B-76i 

1-1 

C 

255 



nto 

NFS-e e NFS-e, preencher se 

IdentificacaoDocumentDeducao igual a 3 

B-77 

DADOS DO FORNECEDOR \(DadosFornecedor\) 

B-73 

1-1 





\# 





Oc Tip Tam 

Dec 

B-78 

B-78a IdentificacaoFornecedor \(Identificação do fornecedor do B-77 

1-1 





Brasil\) 



B-78b CpfCnpj 

Código do IBGE do Município gerador B-78a 

1-1 





da NFS-e 



O 

B-78b1 

Cpf 

CPF do fornecedor do Brasil 

B-78b 

1-1 

C 

11 



U 

O 

B-78b2 

Cnpj 

CNPJ do fornecedor do Brasil 

B-78b 

1-1 

C 

14 



U B-78c FornecedorExterior \(Identificação do fornecedor do B-77 1-1 





exterior\) 



B-78c NifFornecedor 

NIF do fornecedor do exterior 

B-78c 

0-1 

C 

40 





B-78d CodigoPais 

Código do país do fornecedor do exterior 

B-78c 

1-1 

C 

4 



B-79 

DataEmissao 

Data de Emissão do Documento Fiscal 

B-73 

1-1 

D 





B-80 

ValorDedutivel 

Valor dedutível do documento fiscal 

B-73 

1-1 

N 

15 

2 

B-81 

ValorUtilizadoDeducao 

Valor utilizado na dedução da NFS-e. 

B-73 

1-1 

N 

15 

2 

Deve 

ser 

menor 

ou 

igual 

ao 

ValorDedutivel 





ASSINATURAS DIGITAIS 





ASSINATURA DO PRESTADOR 



Oc Tip Tam 

Dec 

B-999 Signature 

Assinatura digital do prestador de 

B 

0-1 





serviços ou de seu preposto 





ASSINATURA DA ADMINISTRACAO TRIBUTARIA MUNICIPAL 



Oc Tip Tam 

Dec 

A-900 Signature 

Assinatura digital da Administração 

A 

0-1 





Tributária Municipal 





CANCELAMENTO NOTA FISCAL DE SERVIÇOS ELETRÔNICA 



Oc Tip Tam 

Dec 

C 

INFORMAÇÕES DO CANCELAMENTO NOTA FISCAL DE SERVIÇOS 



0-1 





ELETRÔNICA \(NfseCancelamento\) 



63





Página 64 de 74 



Revisão 2.04 





C-1 

CANCELAMENTO DA NOTA FISCAL DE SERVIÇOS ELETRÔNICA C 

1-1 





\(Confirmacao\) 





\(Informações GERADAS pelo prestador de serviços\) C-2 

PEDIDO DE CANCELAMENTO DA NFS-e \(Pedido\) 

C-1 





C-3 

InfPedidoCancelamento 

Informações 

do 

pedido 

de 

C-2 

1-1 





cancelamento enviado pelo prestador 

de serviços 

C-4 

IdentificacaoNfse 

Identificação da NFS-e 

C-3 

1-1 





C-5 

Numero 

Número da NFS-e, formado por um 

C-4 

1-1 

N 

15 



número sequencial com 15 posições 

C-6 

CPF OU CNPJ DO PRESTADOR \(CpfCnpj\) 

C-4 

1-1 





C-7 

O Cpf 

Número do CPF do prestador do serviço 

C-6 

1-1 

C 

11 



U Cnpj 

Número do CNPJ do prestador do serviço 

C-6 

1-1 

C 

14 



C-8 

InscricaoMunicipal 

Número de inscrição municipal do 

C-4 

0-1 

C 

15 



prestador de serviço 

C-9 

CodigodoMunicipio 

Código do IBGE do município gerador da 

C-4 

1-1 

N 

7 



NFS-e 

C-10 

CodigoCancelamento 

Código de cancelamento com base na 

C-3 

0-1 

C 

4 



tabela de Erros e alertas. 

1 – Erro na emissão 

2 – Serviço não prestado 

3 – Erro de assinatura 

4 – Duplicidade da nota 

5 – Erro de processamento 

Importante: Os códigos 3 \(Erro de 

assinatura\) e 5 \(Erro de processamento\) 

são de uso restrito da Administração 

Tributária Municipal 





ASSINATURA DO PRESTADOR 



Oc Tip Tam 

Dec 

C-99 

Signature 

Assinatura digital do prestador de 

C-2 

0-1 





serviços ou de seu preposto 





\(INFORMAÇÕES GERADAS PELA ADMINISTRAÇÃO TRIBUTÁRIA MUNICIPAL 



EFETIVAÇÃO DO CANCELAMENTO DA NFS-e 



Oc Tip Tam 

Dec 

C-100 DataHora 

Data 

e 

hora 

da 

efetivação 

do 

C-1 

1-1 DT 





cancelamento 

na 

Administração 

Tributária 

Municipal 

\(AAAA-MM-

DDTHH:mm:ss\) 





ASSINATURA DA ADMINISTRACAO TRIBUTARIA 



Oc Tip Tam 

Dec 

A-901 Signature 

Assinatura digital da Administração 

A 

0-1 





Tributária Municipal 





SUBSTITUIÇÃO DA NOTA FISCAL DE SERVIÇOS ELETRÔNICA Oc Tip Tam 

Dec 

D 

NOTA FISCAL DE SERVIÇOS ELETRÔNICA 





SUBSTITUIDORA\(Informações GERADAS pelo prestador de serviços\) \(NfseSubstituicao\) 

D-1 

IDENTIFICAÇÃO DA NFS-e SUBSTITUIDORA \(SubstituicaoNfse\) 64





Página 65 de 74 



Revisão 2.04 





D-2 

NfseSubstituidora 

Número da NFS-e substituidora 

D-1 

1-1 

N 

15 





ASSINATURA DO PRESTADOR 



Oc Tip Tam 

Dec 

D-98 

Signature 

Assinatura digital do prestador de 

D-1 

0-1 





serviços ou de seu preposto 





ASSINATURA DA ADMINISTRACAO TRIBUTARIA 



Oc Tip Tam 

Dec 

A-902 Signature 

Assinatura digital da Administração 

A 

0-1 





Tributária Municipal 

## 10.3 Recibo Provisório de Serviços 

### B 

DECLARAÇÃO DA PRESTAÇÃO DO SERVIÇO 

A-1 





\(INFORMAÇÕES GERADAS PELO PRESTADOR DE SERVIÇOS\) \(DeclaracaoPrestacaoServico\) 

B-1 

INFORMAÇÕES DECLARAÇÃO DA PRESTAÇÃO DO SERVIÇO 

B 





\(InfDeclaracaoPrestacaoServico\) 

B-2 

RPS \(Rps\) 



B-1 

Oc 

Tip Tam 

Dec 

B-3 

IdentificacaoRps 



B-2 

0-1 





B-4 

Numero 

Número do RPS 

B-3 

1-1 

N 

15 



B-5 

Serie 

Número do equipamento emissor do RPS 

1-1 

C 

5 



B-3 

ou série do RPS 

B-6 

Tipo 

Tipo do RPS 

1-1 

N 

1 



1 – Recibo Provisório de Serviços; 

2 – RPS Nota Fiscal Conjugada 

B-3 

\(Mista\); 

3 – Cupom. 

B-7 

DataEmissaoRps 

Dia, mês e ano da prestação de serviço 

B-2 

1-1 

D 

0 



\(AAAAMMDD\) 



B-8 

Status 

Situação do RPS 

B-2 

1-1 

N 

1 



1 – Normal; 



2 – Cancelado. 



B-9 

IDENTIFICAÇÃO DO RPS SUBSTITUÍDO \(RpsSubstituido\) B-2 

0-1 





B-10 

Numero 

Número do RPS 

B-9 

1-1 

N 

15 



B-11 

Serie 

Número do equipamento emissor do RPS 

1-1 

C 

5 



B-9 

ou série do RPS 

B-12 

Tipo 

Tipo do RPS 

1-1 

N 

1 



1 – Recibo Provisório de Serviços; 

2 – RPS Nota Fiscal Conjugada 

B-9 

\(Mista\); 

3 – Cupom. 





IDENTIFICAÇÃO DA PRESTAÇÃO DO SERVIÇO 



Oc Tip Tam 

Dec 

B-13 

Competencia 

Dia, mês e ano da prestação de serviço 

B-1 

1-1 

D 

0 



\(AAAAMMDD\) 

B-14 

Servico 

Detalhamento do serviço prestado 

B-1 

1-1 





B-15 

Valores 

Valores referentes ao serviço prestado 

B-14 

1-1 





65





Página 66 de 74 



Revisão 2.04 





B-16 

ValorServicos 

Valor dos serviços em R$ 

B-15 

1-1 

N 

15 

2 

B-17 

ValorDeducoes 

Valor das deduções para Redução da 

B-15 

0-1 

N 

15 

2 

Base de Cálculo em R$ 

B-18 

ValorPis 

Valor da retenção do PIS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-19 

ValorCofins 

Valor da retenção do COFINS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-20 

ValorInss 

Valor da retenção do INSS em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-21 

ValorIr 

Valor da retenção do IR em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-22 

ValorCsll 

Valor da retenção do CSLL em R$ 

B-15 

0-1 

N 

15 

2 

Informação declaratória 

B-23 

OutrasRetencoes 

Outras retenções na Fonte. Informação 

B-15 

0-1 

N 

15 

2 

declaratória 

B-24 

ValTotTributos 

Valor total aproximado dos tributos 

B-15 

0-1 

N 

15 

2 

federais, estaduais e municipais, em 

conformidade com o artigo 1o da Lei no 

12.741/2012 

B-25 

ValorIss 

Valor do ISS devido em R$ 

B-15 

0-1 

N 

15 

2 

B-26 

Alíquota 

Alíquota do serviço prestado 

B-15 

0-1 

N 

4 

2 

B-27 

DescontoIncondicionado 

Valor do desconto incondicionado 

B-15 

0-1 

N 

15 

2 

B-28 

DescontoCondicionado 

Valor do desconto condicionado 

B-15 

0-1 

N 

15 

2 

B-29 

IssRetido 

ISS é retido na fonte 

B-14 

1-1 

N 

1 



1 – Sim; 



2 – Não. 



B-30 

ResponsavelRetencao 

Informado somente se IssRetido igual a 

B-14 

0-1 

N 

1 



“1 – Sim” 



A opção “2 – Intermediário” somente 

poderá ser selecionada se 

“CpfCnpjIntermediario” informado. 

1 – Tomador; 

2 – Intermediário. 

B-31 

ItemListaServico 

Subitemdo serviço prestado conforme 

B-14 

1-1 

C 

5 



LC 116/2003 

B-32 

CodigoCnae 

CNAE 

B-14 

0-1 

N 

7 



B-33 

CodigoTributacaoMunicípio 

Código do serviço prestado próprio do 

B-14 

0-1 

C 

20 



município 

B-34 

CodigoNbs 

Código NBS 

B-14 

0-1 

C 

9 



B-35 

Discriminacao 

Discriminação dos serviços 

B-14 

1-1 

C 

2000 



B-36 

CodigoMunicipio 

Código do município onde o serviço foi 

B-14 

1-1 

N 

7 



prestado \(tabela do IBGE\), se exterior 

colocar 9999999 

B-37 

CodigoPais 

Código do país onde o serviço foi 

B-14 

0-1 

N 

4 



prestado \(Tabela de país do IBGE\). 

Preencher somente se 

MunicipioPrestacaoServico igual 

9999999 



66





Página 67 de 74 



Revisão 2.04 





B-38 

ExigibilidadeISS 

Exigibilidades possíveis 

B-14 

1-1 

N 

2 



1 – Exigível; 

2 – Não incidência; 

3 – Isenção; 

4 – Exportação; 

5 – Imunidade; 

6 – Exigibilidade Suspensa por 

Decisão Judicial; 

7 – Exigibilidade Suspensa por 

Processo Administrativo. 

B-39 

IdentifNaoExigibilidade 

Identificação da não exigibilidade do 

B-14 

0-1 

C 

4 



ISSQN – somente para os casos de 

benefício fiscal 

B-40 

MunicipioIncidencia 

Código do município onde é a incidência 

B-14 

0-1 

N 

7 



do imposto \(Tabela do IBGE\) 

B-41 

NumeroProcesso 

Número do processo judicial ou 

B-14 

0-1 

C 

30 



administrativo de suspensão da 

exigibilidade. Obrigatório e informado 

somente quando declarada a suspensão 

da exigibilidade do tributo 





B-41 

IDENTIFICAÇÃO DO PRESTADOR \(Prestador\) 

B-1 

1-1 





B-42 

CPF OU CNPJ DO PRESTADOR \(CpfCnpj\) 

B-41 

1-1 





B-43 

O Cpf 

Número do CPF do prestador do serviço 

B-42 

1-1 

C 

11 



U Cnpj 

Número do CNPJ do prestador do serviço 

B-42 

1-1 

C 

14 



B-44 

InscricaoMunicipal 

Número de inscrição municipal do 

B-41 

0-1 

C 

15 



prestador de serviço 





B-45 

IDENTIFICAÇÃO DO TOMADOR DO SERVIÇO \(TomadorServico\) B-1 

0-1 





B-46 

IDENTIFICAÇÃO DO TOMADOR \(IdentificacaoTomador\) 

B-45 

0-1 





B-47 

CPF OU CNPJ DO TOMADOR 



B-46 

0-1 





\(CpfCnpj\) 

B-48 

O Cpf 

Número do CPF do tomador do serviço 

B-47 

1-1 

C 

11 



U Cnpj 

Número do CNPJ do tomador do serviço 

B-47 

1-1 

C 

14 



B-49 

InscricaoMunicipal 

Número de inscrição municipal do 

B-46 

0-1 

C 

15 



tomador de serviço 

B-50 

NifTomador 

Este elemento só deverá ser preenchido 

B-45 

0-1 

C 

40 



para tomadores não residentes no Brasil 

B-51 

RazaoSocial 

Nome / Razão Social do tomador. 

B-45 

1-1 

C 

150 





\# 





Oc Tip Tam 

Dec 

B-52 



B-52a ENDEREÇO DO TOMADOR \(Endereco\) 

B-45 

1-1 





B-52b Endereco 

Tipo e nome do logradouro do tomador B-52a 1-1 

C 

255 



do serviço 



B-52c Numero 

Número do imóvel do tomador do serviço 

B-52a 

1-1 

C 

60 





B-52d Complemento 

Complemento do endereço do tomador B-52a 

0-1 

C 

60 



do serviço 



B-52e Bairro 

Bairro do tomador do serviço 

B-52a 

1-1 

C 

60 





B-52f CodigoMunicipio 

Código do município do tomador do B-52a 

1-1 

N 

7 



serviço \(Tabela do IBGE\) 



O B-52g Uf 

Sigla da unidade da federação do B-52a 

1-1 

C 

2 



U 

tomador do serviço 



67





Página 68 de 74 



Revisão 2.04 





B-52h Cep 

Número do CEP do tomador do serviço 

B-52a 

1-1 

C 

8 





B-52i ENDEREÇO DO TOMADOR DO EXTERIOR 

B-45 

1-1 





\(EnderecoExterior\) 



B-52j CodigoPais 

Código do país do tomador do serviço 

B-52i 

1-1 

N 

4 



\(Tabela do de país do IBGE\). 



B-52k EnderecoCompletoEx Descrição completa do endereço do B-52i 

1-1 

C 

255 



terior 

exterior 

B-53 

CONTATO DO TOMADOR \(Contato\) 

B-45 

0-1 





B-54 

Telefone 

Número do telefone do tomador 

B-53 

0-1 

C 

20 



B-55 

Email 

E-mail do tomador 

B-53 

0-1 

C 

80 





B-56 

DADOS DO INTERMEDIÁRIO 

B-1 

Oc Tip Tam 

Dec 

B-57 

IDENTIFICAÇÃO DO INTERMEDIÁRIO \(IdentificacaoIntermediario\) B-56 

0-1 





B-58 

CPF OU CNPJ DO INTERMEDIÁRIO \(CpfCnpj\) 

B-57 

1-1 





B-59 

Cpf 

Número do CPF do intermediário do 

B-58 

1-1 

C 

11 



O

serviço 

U Cnpj 

Número do CNPJ do intermediário do 

B-58 

1-1 

C 

14 



serviço 

B-60 

InscricaoMunicipal 

Número de inscrição municipal do 

B-57 

0-1 

C 

15 



intermediário de serviço 





B-61 

RazaoSocial 

Nome ou Razão Social de intermediário 

B-56 

0-1 

C 

150 



do serviço 

B-62 

CodigoMunicipio 

Código do município onde o intermediário 

B-56 

0-1 

N 

7 



está estabelecido \(Tabela do IBGE\) 





DETALHAMENTO ESPECÍFICO DE OBRA DE ENGENHARIA E 



Oc Tip Tam 

Dec 

ARQUITETURA EM GERAL 

B-63 

OBRA DE ENGENHARIA E ARQUITETURA EM GERAL\(ConstrucaoCivil\) B-1 

0-1 





B-64 

CodigodaObra 

Número de identificação da obra 

B-63 

0-1 

C 

30 



B-65 

Art 

Número da ART 

B-63 

0-1 

C 

30 





B-66 

RegimeEspecialTributacao 

Tipos de Regimes especiais: 

B-1 

0-1 

N 

2 



1 – Microempresa Municipal; 

2 – Estimativa; 

3 – Sociedade de Profissionais; 

4 – Cooperativa; 

5 – Microempresário Individual \(MEI\); 

6 – Microempresa ou Empresa de 

Pequeno Porte \(ME EPP\). 

B-67 

OptanteSimplesNacional 

Prestador é optante pelo Simples 

B-1 

1-1 

N 

1 



Nacional: 

1 – Sim; 

2 – Não . 

B-68 

IncentivoFiscal 

Prestador possui Incentivo Fiscal: 

B-1 

1-1 

N 

1 



1 – Sim; 



2 – Não. 





B-69 

EVENTO \(Evento\) 

B-1 

0-1 





68





Página 69 de 74 



Revisão 2.04 





B-70 

IdentificacaoEvento 

Identificação do evento \(Obrigatório se 

B-69 

0-1 

C 

30 



DescricaoEvento não informado\) 

B-71 

DescricaoEvento 

Descrição do evento \(Obrigatório se 

B-69 

0-1 

C 

255 



IdentificacaoEvento não informado\) 





B-72 

InformacoesComplementares 

Informações complementares para uso 

B-1 

0-1 

C 

## 2.000 

### do prestador de serviços conforme 

regulamento do município, preenchido no 

padrão JSON 





B-73 

DEDUÇÃO \(Deducao\) 



B-1 

0-N 





TipoDeducao 

Identificação da dedução 

B-73 

1-1 

N 

2 



1 – Materiais; 

2 – Subempreitada de mão de 

obra; 

3 – Serviços; 

4 – Produção externa; 

5 – Alimentação e bebidas/frigobar; 

6 – Reembolso de despesas; 

7 – Repasse consorciado; 

8 – Repasse plano de saúde 

99 – Outras deduções 

B-74 

DescricaoDeducao 

Informar o tipo da dedução no caso da 

B-73 

0-1 

C 

150 



opção 7 – Outras Deduções 

B-75 

DOCUMENTO DA DEDUÇÃO \(IdentificacaoDocumentoDeducao\) B-74 

1-1 





\# 





Oc Tip Tam 

Dec 

B-76 

B-76a IdentificacaoNfse 

B-75 

1-1 





B-76b CodigoMunicipioGera Código do IBGE do Município gerador da B-76a 1-1 

N 

7 





dor 

NFS-e 



B-76c NumeroNfse 

Número da NFS-e 

B-76a 

1-1 

N 

15 





B-76d CodigoVerificacao 

Código de Verificação da NFS-e 

B-76a 

0-1 

C 

9 





B-76e IdentificacaoNFe \( 

B-75 

1-1 





O B-76f NumeroNfe 

Número da NF-e 

B-76e 

1-1 

N 

9 



U 



B-76g UfNfe 

Unidade da Federação da NF-e 

B-76e 

1-1 

C 

2 





B-76h ChaveAcessoNfe 

Chave de acesso da NF-e 

B-76e 

0-1 

N 

44 





B-76i OutroDocumento 

B-75 

1-1 





B-76j IdentificacaoDocume

Número de documento fiscal diferente de 

B-76i 

1-1 

C 

255 



nto 

NFS-e e NFS-e, preencher se 

IdentificacaoDocumentDeducao igual a 3 

B-77 

DADOS DO FORNECEDOR \(DadosFornecedor\) 

B-73 

1-1 





\# 





Oc Tip Tam 

Dec 

B-78 

B-78a IdentificacaoFornecedor \(Identificação do fornecedor do B-77 

1-1 





Brasil\) 

B-78b CpfCnpj 

Código do IBGE do Município gerador B-78a 

1-1 





da NFS-e 



O 

B-78b1 

Cpf 

CPF do fornecedor do Brasil 

B-78b 

1-1 

C 

11 



U 

O 

B-78b2 

Cnpj 

CNPJ do fornecedor do Brasil 

B-78b 

1-1 

C 

14 



U B-78c FornecedorExterior \(Identificação do fornecedor do B-77 1-1 





exterior\) 



69





Página 70 de 74 



Revisão 2.04 





B-78c NifFornecedor 

NIF do fornecedor do exterior 

B-78c 

0-1 

C 

40 





B-78d CodigoPais 

Código do país do fornecedor do exterior 

B-78c 

1-1 

C 

4 



B-79 

DataEmissao 

Data de Emissão do Documento Fiscal 

B-73 

1-1 

D 





B-80 

ValorDedutivel 

Valor dedutível do documento fiscal 

B-73 

1-1 

N 

15 

2 

B-81 

ValorUtilizadoDeducao 

Valor utilizado na dedução da NFS-e. 

B-73 

1-1 

N 

15 

2 

Deve 

ser 

menor 

ou 

igual 

ao 

ValorDedutivel 





ASSINATURAS DIGITAIS 





ASSINATURA DO PRESTADOR 



Oc Tip Tam 

Dec 

B-999 Signature 

Assinatura digital do prestador de 

B 

0-1 





serviços ou de seu preposto 





70





Página 71 de 74 



Revisão 2.04 





11 GLOSSÁRIO 

TERMO 

CONCEITO 

Assinatura Digital 

Código de criptografia \(chave privada\) anexado ou logicamente associado a uma mensagem eletrônica que permite de forma única e exclusiva a comprovação da autoria de um determinado conjunto de dados de computador \(um arquivo, um email ou uma transação\). A assinatura digital comprova que a pessoa criou ou concorda com um documento assinado digitalmente, como a assinatura de próprio punho comprova a autoria de um documento escrito. A verificação da origem do dado é feita com a chave pública do remetente. 

Cadastro de Contribuintes do ISS 

É a base que contém os registros de dados dos contribuintes do ISS. 

Certificação Digital 

É a atividade de reconhecimento em meio eletrônico, que se caracteriza pelo estabelecimento de uma relação única, exclusiva e intransferível entre uma chave de criptografia, inserida em um Certificado Digital; uma pessoa física, jurídica, máquina ou aplicação e a Autoridade Certificadora. 

Certificado Digital 

\(1\) É um documento contendo dados de identificação da pessoa ou instituição que deseja, por meio deste, comprovar, perante terceiros, a sua própria identidade. 

Serve igualmente para conferir a identidade de terceiros. 

\(2\) É um conjunto de dados de computador, gerados em observância à Recomendação Internacional ITU-T X.509, que se destina a registrar, de forma única, exclusiva e intransferível, a relação existente entre uma chave de criptografia, uma pessoa física, jurídica, máquina ou aplicação e a Autoridade Certificadora. O Certificado Digital pode ser armazenado em um software ou em um hardware. 

Código NBS 

O código na Nomenclatura Brasileira de Serviços, Intangíveis e Outras Operações que Produzam Variações no Patrimônio \(NBS\) é composto por nove dígitos, sendo que sua significância, da esquerda para a direita, é: a\) o primeiro dígito, da esquerda para a direita, é o número 1 e é o indicador que o código que se segue se refere a um serviço, intangível ou outra operação que produz variação no patrimônio; 

b\) o segundo e o terceiro dígitos indicam o Capítulo da NBS; c\) o quarto e o quinto dígitos, associados ao primeiro e ao segundo dígitos, representam a posição dentro de um Capítulo; 

d\) o sexto e o sétimo dígitos, associados aos cinco primeiro dígitos, representam, respectivamente, as subposições de primeiro e de segundo nível; e\) o oitavo dígito é o item; e 

f\) o nono dígito é o subitem. 

A sistemática de classificação dos códigos da NBS obedece à seguinte estrutura: Exemplo: 

O código 1.1403.21.10, onde se classificam os “serviços de engenharia de projetos de construção residencial” deve ser entendido, da esquerda para a direita, da forma que se segue: 

a\) o algarismo \(1\), da esquerda para a direita, sinaliza que se trata de código que se aloja na NBS; 

b\) o segundo e o terceiro dígitos \(14\) informa que o código em tela está no Capítulo 14, dedicado aos “Outros Serviços Profissionais”; c\) o quarto e o quinto, da esquerda para a direita \(03\), associados ao primeiro, segundo e terceiro dígitos, separados por um ponto, \(1.14\) assinala que a terceira posição do Capítulo 14 é ocupada pelos “serviços de engenharia”; d\) o sexto e o sétimo dígitos, da esquerda para a direita, indicam, 71





Página 72 de 74 



Revisão 2.04 





TERMO 

CONCEITO 

respectivamente, as subposições de primeiro e segundo nível \(21\); e\) o oitavo dígito \(1\) diz que há item no código; e f\) o nono dígito \(0\) informa que o item não foi desdobrado \(se o fosse, então o algarismo deveria ser diferente de zero\). 

Dessa maneira, fica claro que nem sempre o código NBS se apresenta totalmente desdobrado, isto é, um algarismo diferente de zero para subitem como, por exemplo: 

1.0119.10.00 | Serviços de construção de estruturas de prédios 1.0606.10.00 | Serviços de operação de aeroportos, exceto manuseio de cargas 

1.0905.91.00 | Serviços de consultoria financeira 1.2206.19.10 | Serviços de palestras e conferências Declaração Eletrônica de Serviços 

Sistema destinado ao preenchimento e transmissão de dados relativos aos serviços prestados e tomados; à apuração do ISS a recolher ou a pagar e à geração das respectivas guias de recolhimento ou de pagamento. 

DES 

Veja “Declaração Eletrônica de Serviços”. 

Exportação 

Serviço para o exterior do País cujo resultado lá se verifique Hash 

É o resultado da ação de algoritmos que fazem o mapeamento de uma sequência de bits de tamanho arbitrário para uma sequência de bits de tamanho fixo menor - 

conhecido como resultado hash - de forma que seja muito difícil encontrar duas mensagens produzindo o mesmo resultado hash \(resistência à colisão\), e que o processo reverso também não seja realizável \(dado um hash, não é possível recuperar a mensagem que o gerou\). 

HTTPS 

HTTPS \(HyperText Transfer Protocol Secure\), é uma implementação do protocolo HTTP sobre uma camada SSL ou do TLS. Essa camada adicional permite que os dados sejam transmitidos através de uma conexão criptografada e que se verifique a autenticidade do servidor e do cliente, por meio de certificados digitais. 

O protocolo HTTPS é normalmente utilizado quando se deseja evitar que a informação transmitida entre o cliente e o servidor seja visualizada por terceiros, como por exemplo no caso de compras on-line. Nas URLs dos sítios o início ficaria 

'https://'. 

ICP–Brasil 

Infraestrutura de Chaves Públicas Brasileira, instituída a partir da medida provisória 2.200/2001, composta de entidades públicas e privadas, homologadas pela comissão de certificados digitais, que podem ser utilizadas para a conferência de assinaturas digitais, conferindo-lhes validade jurídica. É um conjunto de técnicas, arquitetura, organização, práticas e procedimentos, implementados pelas organizações governamentais e privadas brasileiras que suportam, em conjunto, a implementação e a operação de um sistema de certificação, com o objetivo de estabelecer os fundamentos técnicos e metodológicos de um sistema de certificação digital, baseado em criptografia de chave pública, garantir a autenticidade, a integridade e a validade jurídica de documentos em forma eletrônica, das aplicações de suporte e das aplicações habilitadas que utilizem certificados digitais, bem como a realização de transações eletrônicas seguras. 

Imposto Sobre Serviços de Qualquer É o imposto de competência dos Municípios e do Distrito Federal, por força da CF, Natureza 

art 156, III, que tem como fato gerador a prestação dos serviços constantes da lista anexa à Lei Complementar 116/2003. 

Imunidade 

Atividade não tributável por força de dispositivo constitucional Infraestrutura de Chaves Públicas 

Veja “ICP-Brasil”. 

Brasileira 

Isenção 

Dispensa do pagamento do imposto por força de lei do município onde o imposto seria devido 

ISS 

Veja “Imposto Sobre Serviços de Qualquer Natureza”. 

Lote de RPS 

Quantidade de RPS \(veja “Recibo Provisório de Serviços”\) que será enviada conjuntamente à Administração Pública Municipal para validação, processamento e geração das respectivas NFS-e \(veja “Nota Fiscal de Serviços Eletrônica”\). 

Não incidência 

Serviços não previstos em lei complementar que autorize sua tributação 72





Página 73 de 74 



Revisão 2.04 





TERMO 

CONCEITO 

NBS 

Nomenclatura Brasileira de Serviços, Intangíveis e Outras Operações que Produzam Variações no Patrimônio. 

Código composto por nove dígitos, desenvolvido pela Receita Federal do Brasil – 

RFB, conjuntamente com o Ministério do Desenvolvimento, Indústria e Comércio – 

MDIC, que identifica os serviços passíveis de registro no Siscoserv. 

NFS-e 

Veja “Nota Fiscal de Serviços Eletrônica”. 

NIF 

Número de Identificação Fiscal – número fornecido pelo órgão de administração tributária no exterior indicador de pessoa física ou jurídica. 

Nota Fiscal de Serviços Eletrônica 

É um documento de existência exclusivamente digital, gerado e armazenado eletronicamente pela Administração Tributária Municipal ou por outra entidade conveniada, para documentar as operações de prestação de serviços. 

Prestador de Serviços 

Aquele que desenvolve a atividade de prestar serviço de modo permanente ou temporário. 

Processos Assíncronos 

Um processo assíncrono será executado em um momento posterior ao recebimento da requisição pelo responsável em processá-la. Um processo assíncrono não necessita que o transmissor e o receptor da requisição estejam conectados durante todo o processo. O sistema que irá processar a requisição pode escolher o melhor momento para execução da atividade, sem exceder os recursos disponíveis \(conexão, processador, memória\) e sem colocar em risco os serviços concorrentes do servidor. 

Por exemplo, citando a solução de Recibos Provisórios de Serviços, ao enviar uma requisição para processar uma grande quantidade de RPS, convertendo-os em notas fiscais e gravando-os na base de dados, uma solução que alivie a carga do servidor deve ser usada. Desta forma, quando o grupo de RPS é recebido ele será colocado em uma fila de prioridades, para ser processado quando os recursos estiverem disponíveis. O requerente do serviço recebe uma mensagem que a requisição foi recebida e dentro de um prazo estimado poderá consultar suas notas geradas. 

Processos Síncronos 

Um processo síncrono será executado no momento do envio da requisição, esse tipo de processo exige uma conexão ativa durante o envio da requisição, processamento e recebimento da resposta. 

Por exemplo, ao enviar uma requisição de consulta de uma nota fiscal a um serviço síncrono, o processamento se dará assim que a requisição for recebida e a resposta será retornada assim que a nota tiver sido localizada na base de dados. 

Dependendo da velocidade da conexão e dos recursos disponíveis no servidor \(memória, processador\), esta resposta poderá ser imediata ou durar alguns segundos. 

Recibo Provisório de Serviços 

É o documento fornecido pelo contribuinte ao tomador do serviço com os dados de uma operação que deverão ser informados ou transmitidos posteriormente ao Administração Pública Municipal quando não for possível a geração imediata da respectiva NFS-e. 

RPS 

Veja “Recibo Provisório de Serviços”. 

Serviço não tributado 

Serviço tributável não previsto em lei municipal Serviço Tributado 

É o serviço tributável previsto em lei municipal que crie para o contribuinte a obrigação tributária de pagar o ISS 

Serviço Tributável 

Serviços previstos em lei complementar que autorize os municípios a tributar SFT 

Veja “Sistema de Fiscalização Tributária”. 

Siscoserv 

Sistema Integrado de Comércio Exterior de Serviços, Intangíveis e Outras Operações que Produzam Variações no Patrimônio – um sistema informatizado, desenvolvido pelo Governo Federal como ferramenta para o aprimoramento das ações de estímulo, formulação, acompanhamento e aferição das políticas públicas relacionadas a serviços e intangíveis bem como para a orientação de estratégias empresariais de comércio exterior de serviços e intangíveis. 

Sistema de Fiscalização Tributária 

Sistema de gestão e fiscalização tributária, utilizado como auxiliar das tomadas de decisões e tarefas fiscais. 



73





Página 74 de 74 



Revisão 2.04 





TERMO 

CONCEITO 

Simples Nacional 

Regime único de arrecadação de impostos e contribuições federais, estaduais e municipais, instituído pela Lei Complementar 123/2006. 

SOAP 

SOAP \(acrônimo do inglês Simple Object Access Protocol\) é um protocolo para intercâmbio de mensagens entre programas de computador. Geralmente servidores SOAP são implementados utilizando-se servidores HTTP pré-existentes, embora isto não seja uma restrição para funcionamento do protocolo. 

As mensagens SOAP são documentos XML que aderem a uma especificação fornecida pelo órgão W3C. 

Tomador de Serviços 

O destinatário do serviço prestado. 

W3C 

World Wide Web Consortium é um consórcio de empresas de tecnologia, fundado para levar a Web ao seu potencial máximo, por meio do desenvolvimento de protocolos comuns e fóruns abertos que promovem sua evolução e asseguram a sua interoperabilidade. O W3C desenvolve tecnologias denominadas “padrões da web” para a criação e interpretação dos conteúdos para a Web. Sítios da Web desenvolvidos segundo esses padrões podem ser acessados e visualizados por qualquer pessoa ou tecnologia, independente de hardware ou software utilizados, de maneira rápida e compatível com os novos padrões e tecnologias que possam surgir com a evolução da internet. 

Web Services 

Web service é uma solução utilizada na integração de sistemas e na comunicação entre aplicações diferentes. Com esta tecnologia é possível que novas aplicações possam interagir com aquelas que já existem e que sistemas desenvolvidos em plataformas diferentes sejam compatíveis. 

WSDL 

É a sigla de \(Web Service Description Language\), padrão baseado em XML para descrever o serviço, que traz os métodos do web service. Funciona como uma espécie de Type Library do Web Service, além de ser usado para a validação das chamadas dos métodos. 

XML 

XML \(Extensible Markup Language\) é uma recomendação da W3C para gerar linguagens de marcação para necessidades especiais. Seu propósito principal é a facilidade de compartilhamento de informações através da Internet. 





74



