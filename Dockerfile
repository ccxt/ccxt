FROM alpine:3.16.7

ADD ./ /ccxt
WORKDIR /ccxt

# Miscellaneous deps
RUN apk update && apk add curl gnupg git ca-certificates gmp-dev build-base
# PHP
RUN apk add php81 php81-curl php81-iconv php81-mbstring php81-bcmath php81-gmp php81-openssl php81-phar
RUN ln -s /usr/bin/php81 /usr/bin/php
# Node
RUN apk add nodejs npm
# Python 3
RUN apk add python3 python3-dev py3-pip libffi-dev
RUN pip3 install 'idna==2.9' --force-reinstall
RUN pip3 install --upgrade setuptools==65.7.0
RUN pip3 install --ignore-installed tox
RUN pip3 install aiohttp
RUN pip3 install cryptography
RUN pip3 install requests
# Dotnet
RUN curl -fsSL https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -o packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update
RUN apt-get install -y dotnet-sdk-7.0
# Installs as a local Node & Python module, so that `require ('ccxt')` and `import ccxt` should work after that
RUN npm install
RUN ln -s /ccxt /usr/lib/node_modules/
RUN echo "export NODE_PATH=/usr/lib/node_modules" >> $HOME/.bashrc
RUN cd python \
    && pip3 install -e . \
    && cd ..
## Install composer and everything else that it needs and manages
RUN /ccxt/composer-install.sh
RUN apk add zip unzip php81-zip
RUN mv /ccxt/composer.phar /usr/local/bin/composer
RUN composer install