Formulário de Upload
====================

Regras Gerais
-------------

- Fomulários podem conter campos e seletores de arquivos.
- O método HTTP deve ser POST
- O nome do campo de seleção de arquivo deve ser obrigatoriamente `files`.

Links
-----

- [Demonstração do Formulário de Upload](demo-upload.jade)

Determinando o destido do arquivo
---------------------------------

O recurso especificado na ação do formulário deve ser formado da seguinte forma:

    method="/upload/[caminho-do-arquivo]"

Quando `[caminho-do-arquivo]` termina com uma barra o MarkBrowser interpreta o nome
como o de uma pasta e distribui os arquivos dentro dela. Quando não termina com uma
barra o MarkBrowser interpreta a última parte do caminho como um prefixo para o
arquivo salvo.

O parâmetro `[caminho-do-arquivo]` é relativo à pasta de trabalho do site.

Gerenciamento dos arquivos
--------------------------

O módulo de upload armazena:

- Os arquivos submetidos
- Um arquivo JSON contendo os campos enviados com o formulário.

Controlando o nome do arquivo e a página de sucesso
---------------------------------------------------

O nome do arquivo pode ser controlado pelo campo oculto do formulário:

    up.uid

O MarkBrowser usa o valor do campo indicado pelo `up.uid` para compor o nome do arquivo.
Caso o nome do campo do arquivo seja diferente de `default` o nome deste campo também é adicionado como um sufixo do arquivo.

Este é o template de nome utilizado para cada arquivo:

    {valor do campo definido por up.uid}.{nome do campo de upload}.{extensao}

E a página de sucesso exibida depois do upload pode ser controlada por um dos campos ocultos:

    up.fwd
    up.forward

Exemplo prático
---------------

No exemplo abaixo dois arquivos serão submetidos.

<?prettify lang="jade"?>

```jade
form(method='POST', action='/upload/users/files/', role='form', enctype="multipart/form-data")

  input(type='hidden', name='up.uid', value='email')
  input(type='hidden', name='up.fwd', value='/wiki/users/sucesso.md')

  .form-group
    label User
    input.form-control(type='text', name='name', placeholder='Fulano de Tal')

  .form-group
    label Email
    input.form-control(type='email', name='email', placeholder='user@host.com')

  .form-group
    label Curriculum
    input.form-control(type='file', name='curriculum')

  .form-group
    label Demo Application
    input.form-control(type='file', name='default')

  button.btn.btn-primary(type='submit') Upload
```

Se o usuário informasse os dados:

User
:   Fulano
Email
:   fulano@host.com
Curriculum
:   vitae.pdf
Demo Application
:   trabalho.zip

Os dois arquivos seriam nomeados desta forma no servidor:

Arquivo 1
:   /wiki/users/files/fulano@host.com.curriculum.pdf

Porque:

-  O campo `up.uid` diz que o nome do arquivo deve ser o valor do campo `email`
-  E o nome do campo do email não é `default` mas sim `curriculum`.
           Neste caso o nome do campo será adicionado como sufixo.

Arquivo 2
:   /wiki/users/files/fulano@host.com.zip

Porque:

-  O campo `up.uid` diz que o nome do arquivo deve ser o valor do campo `email`
-  O nome do campo do email não é `default`.
   Neste não haverá sufixo.
