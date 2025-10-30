### Instalar NGINX Ubuntu

    sudo apt-get update -y# Actualización de los repositorios mas recientes
    sudo apt install nginx# Instalamos NGINX
    sudo ufw app list# Aplicaciones disponibles para FIREWALL
    sudo ufw allow 'Nginx HTTP'# Abrri el puerto HTTP
    sudo ufw allow 'Nginx HTTPS'# Abrri el puerto HTTPS
    sudo ufw allow ssh# Abrrir el puerto SSH para conectarse
    sudo ufw enable# Activar las reglas aplicadas
    sudo ufw status#Verficar las reglas aplicadas
    curl localhost# Probamos la carga de la página
    mkdir /var/www/sitio1#Crear carpetas para sitios virtuales nginx
    mkdir /var/www/sitio2
    nano index.html#Crear en cada carpeta un index.html con contenido
    chown -R ubuntu:ubuntu /var/www/sitio1#Asignar las carpetas a mi grupo y usuario
    chown -R ubuntu:ubuntu /var/www/sitio2
    chmod -R 755 /var/www/sitio1#Dar permisos para los carpetas
    chmod -R 755 /var/www/sitio2
    cp default sitio1#Realizar copia de archivo /etc/nginx/sties-available/default por cada sitio
    cp default sitio2


**Configurar los bloques de sitios**
```shell
server {
    if ($host = www.grafiya.com.pe) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = grafiya.com.pe) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name grafiya.com.pe www.grafiya.com.pe;
    return 404; # managed by Certbot
}


server {
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/grafiya.com.pe/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/grafiya.com.pe/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    root /var/www/emax-front/dist/emax-front/browser;
         index index.html index.htm index.csr.html;
    server_name grafiya.com.pe www.grafiya.com.pe;

    error_log /var/log/nginx/grafiya-error.log;

    location / {
        try_files $uri $uri/ @node;
    }

    location @node {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
    cd /etc/nginx/sites-enabled     #Ir a la carpeta donde estas los sitios habilitados
    ln -s /etc/nginx/sites-available/sitio1 /etc/nginx/sites-enabled/sitio1	    #Crear enlaces simbolicos por cada bloque de sitio
    ln -s /etc/nginx/sites-available/sitio2 /etc/nginx/sites-enabled/sitio2
    sudo nginx -t                   #Verifcar archivos escritos correctamente
    sudo service nginx restart      #Reiniciamos nginx
    sudo service nginx reload       #Reiniciamos nginx

---
### Instalar CERTIFICADO SLL certbot
	
    sudo certbot --version    # Verificar si esta instalado
    sudo apt update           # Actualizacion de los paquetes
    sudo apt install -y certbot   # Instalamos certbot
    sudo apt install -y python3-certbot-nginx   #  Para usuarios de Nginx
    sudo certbot --nginx      # Escoger el tipo de servidor
    Entrar correo, 2 veces Y y al final escoger los dominios para aplicar
    sudo service nginx restart    # Reiniciamos nginx ó
    sudo service nginx reload#    Reinicar otra manera

---

### Instalamos NVM en Ubuntu para NODE + NPM + EXPRESS

***NVM(Node Version Manager)*** nos permite tener múltiples versiones de NODE junto a su ***NPM(Node package manager)*** en nuestro sistema para trabajar con diferentes versiones de proyectos.

    nvm --version   # Verifica si tienes instaldo NVM
    sudo apt-get install nodejs npm -y    # Instalamos la version de node y npm
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash     # Instalamos Node Version Manager
    $ source ~/.bashrc    # Asociamos al perdil del usuario
    git clone  ....       # Traemos el proyecto
    nvm install 20        # Instalamos la version 20 de Node o la que requiera tu proyecto
    nvm install latest    # Instalamos la ultima version de Node 
    npm install -g npm@latest   # Consigue la ultima version de NPM	
    npm install                 # Actualización de dependencias del proyecto y Express Js si tiene
    nvm ls                # Listar todas las versiones de node instaladas:
    nvm install node      # Instalar la última versión de node:
    nvm ls-remote         # Ver todas las versiones de node disponibles para instalar (ubuntu)
    nvm list available    # Ver todas las versiones de node disponibles para instalar (windows)
    nvm use <vers>        # Utilizar una versión específica:
    nvm uninstall [vers]  # Desinstalar una versión específica.
    nvm alias default [vers]    # Establecer una versión de node por defecto.
    
    NVM para windows puedes descargarlo en https://github.com/coreybutler/nvm-windows
    nvm use (Get-Content .nvmrc)  # En el proyecto en la Terminal se cambia a la version especificada en el archivo nvmrc 

---

### Instalar ANGULAR

    ng version    # Version angular
    node -v       # Version node si no esta gestionado por NVM
    npm -v        # Version npm si no esta gestionado por NVM
    ng build --configuration production     # Compila el entorno de produccion
    ng build --configuration development    # Compila el entorno de desarrollo
    npm run build --configuration --production    # Compila el entorno de produccion
    npm run build --configuration --development   # Compila el entorno de desarrollo
    npm install -g @angular/cli@latest            # Instalar la última versión de Angular
    npm install -g @angular/cli@20.1.2            # Instalar una version especifica de angular
    npm install @angular/cli@20.1.0               # Instala una version especifica pero no global, cuadno se tiene varios proyectos angular, instalar enla carpeta base
    ng serve    #Levanta proyecto angular
    npm start   #Levanta proyecto angular usar cuando se tiene varios proyectos
    npm uninstall -g @angular/cli           # Desintalar angular cli
    npm cache clean --force                 # Limpiar cache, usado generalmente despues de desintalar
    npm install @angular/cli@20.1.2	--save-dev		#Instalar una version local de angular
    "start": "set NODE_OPTIONS=--openssl-legacy-provider && ng serve -o",   #Se puede modificar el archivo package.json y adicionar funcionalidad
    "build": "set NODE_OPTIONS=--openssl-legacy-provider && ng build",     #Se puede modificar el archivo package.json y adicionar funcionalidad

    Para generar ***"sitemap.xml"*** el archivo **app.routes.server.ts** debe estar en modo RenderMode.Server. En EC2 de AWS el proyecto EMAX esta como root, utilizar comando git con sudo.
    
    Se ha colocado en el /browser 2 archivos el sitemap.xml y el google3eaf13bf6368f525.html para "searchconsole"

---

### Comandos ANGULAR

    ng g c --help   # Muestra la ayuda completa de los comandos disponibles.
    ng g s --help
    ng g m --help
    ng g class --help
    ng g d --help
    ng g g --help
    ng g interceptor --help
    ng build –help
    ng g c --skip-tests   # No genera el archivo de pruebas
    ng g c --inline-style # Incluye los estilos en el archivo .ts, por defecto el archivo es creado externamente y referenciado
    ng g c --flat         # Crea los nuevos archivos en el nivel especificado sin crear el directorio.
    ng g c [nom]          # Genera un nuevo componente
    ng g s [nom]          # Crea un servicio, que permite compartir información entre a aplicación
    ng g m [nom]          # Crea un módulo, que es un agrupador de diferentes componentes
    ng g class [nom]      # Crea una clase
    ng g directive [nom]  # Crea una nueva directiva
    ng g guard [nom]      # Crea un nuevo guard para protección de rutas
    ng g interceptor[nom] # Crea un interceptor para observables
    ng g interface[nom]   # Crea una interface
    ng g enum[nom]        # Crea una enumeración

---


### PM2 para que el servidor nginx este en background

Gestor de procesos de aplicaciones construidas con Node.js

    sudo npm i -g pm2# Instalar PM2 
    pm2 start id
    pm2 start all
    pm2 stop id
    pm2 stop all
    pm2 delete id
    pm2 log
    pm2 monit
      $ crear ecosistema para SSR angular ruta root 
      module.exports = {
        apps: [{
        name: "angular-app",
        script: "dist/server/server.mjs",
        env: {
          PM2: "true"
        }
      }]
      }
    pm2 start ecosystem.config.js
    pm2 stop ecosystem.config.js
    pm2 restart ecosystem.config.js
    pm2 reload ecosystem.config.js
    pm2 delete ecosystem.config.js
    pm2 start npm --name "emax-front-ssr" -- run serve:ssr:emax-front	:correr la aplicacion 

    nohup node server.mjs &	:Enviar a segundo plano un SSR
