FROM ubuntu:20.04

# Supresses unwanted user interaction (like "Please select the geographic area" when installing tzdata)
ENV DEBIAN_FRONTEND=noninteractive

ADD ./ /ccxt
WORKDIR /ccxt

# Update packages (use us.archive.ubuntu.com instead of archive.ubuntu.com — solves the painfully slow apt-get update)
RUN sed -i 's/archive\.ubuntu\.com/us\.archive\.ubuntu\.com/' /etc/apt/sources.list

# Miscellaneous deps
RUN apt-get update && apt-get install -y --no-install-recommends curl gnupg git ca-certificates
# PHP
RUN apt-get install -y software-properties-common && add-apt-repository -y ppa:ondrej/php
RUN apt-get update && apt-get install -y --no-install-recommends php8.1 php8.1-curl php8.1-iconv php8.1-mbstring php8.1-bcmath php8.1-gmp
# Node
RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs
# Python 3
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip
RUN pip3 install 'idna==2.9' --force-reinstall
RUN pip3 install --upgrade setuptools==65.7.0
RUN pip3 install tox
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
RUN apt-get update && apt-get install -y --no-install-recommends zip unzip php-zip
RUN mv /ccxt/composer.phar /usr/local/bin/composer
RUN composer install
## Remove apt sources
RUN apt-get -y autoremove && apt-get clean && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*