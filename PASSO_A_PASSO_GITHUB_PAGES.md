# Publicar o protótipo no GitHub Pages

## 1. Extrair e abrir

1. Extraia o arquivo ZIP.
2. Abra o VS Code.
3. Clique em **File → Open Folder**.
4. Escolha a pasta `acoesja-professor-ia-prototipo` que foi extraída.

Não mova nem renomeie arquivos dentro da pasta. O arquivo de deploy já está no lugar certo.

## 2. Criar o repositório local

No VS Code, clique em **Terminal → New Terminal**. Copie e cole estes comandos, um bloco por vez:

```bash
git init
git add .
git commit -m "Protótipo inicial do Professor IA"
git branch -M main
```

## 3. Criar o repositório no GitHub

1. Entre em https://github.com/new.
2. Dê um nome ao repositório, por exemplo: `acoesja-professor-ia-prototipo`.
3. Escolha **Public** para compartilhar facilmente.
4. **Não** marque as opções para criar README, `.gitignore` ou licença.
5. Clique em **Create repository**.

Na próxima tela, copie a URL que termina em `.git`.

## 4. Enviar ao GitHub

De volta ao terminal do VS Code, substitua `COLE_A_URL_AQUI` pela URL copiada:

```bash
git remote add origin COLE_A_URL_AQUI
git push -u origin main
```

## 5. Ligar o GitHub Pages

1. No GitHub, abra o repositório.
2. Clique em **Settings → Pages**.
3. Em **Source**, selecione **GitHub Actions**.
4. Não escolha os cartões “Jekyll” ou “Static HTML”.
5. Clique na aba **Actions** e aguarde o fluxo **Deploy para GitHub Pages** ficar verde (✓).

Depois disso, o GitHub mostrará o endereço do site. Ele terá este formato:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

## Se aparecer erro no Git

Se o Git pedir seu nome e e-mail, execute antes do commit:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```
