# Descricao para publicacao

## Descricao curta

Adiciona um botao em paginas Heyzine para baixar o PDF original do catalogo.

## Descricao completa

Heyzine PDF Downloader adiciona automaticamente um botao de download em paginas de catalogos publicados na Heyzine quando a extensao detecta o arquivo PDF original usado pelo visualizador.

A extensao funciona apenas em paginas da Heyzine. Ela procura a URL do PDF carregada pela propria pagina e, quando encontra um arquivo valido, mostra o botao para iniciar o download pelo navegador.

## Justificativas de permissoes

### downloads

Necessaria para iniciar o download do PDF original pelo gerenciador de downloads do Chrome. A extensao nao le, altera ou remove downloads existentes.

### https://heyzine.com/* e https://*.heyzine.com/*

Necessarias para executar o script de conteudo nas paginas da Heyzine e detectar quando um catalogo esta aberto. A extensao usa esse acesso apenas para encontrar a URL do PDF na pagina atual e exibir o botao de download.

### https://cdnc.heyzine.com/*

Necessaria porque muitos PDFs originais da Heyzine sao servidos por esse dominio de CDN. Esse acesso permite que o Chrome baixe o arquivo PDF encontrado pela extensao.

## Privacidade

A extensao nao coleta, armazena ou envia dados pessoais. Todo o processamento acontece localmente no navegador, na pagina da Heyzine aberta pelo usuario.
