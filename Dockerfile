FROM ubuntu:20.04

# Supresses unwanted user interaction (like "Please select the geographic area" when installing tzdata)
ENV DEBIAN_FRONTEND=noninteractive

ADD ./ /ccxt
WORKDIR /ccxt

# Update packages (use us.archive.ubuntu.com instead of archive.ubuntu.com — solves the painfully slow apt-get update)
RUN sed -i 's/archive\.ubuntu\.com/us\.archive\.ubuntu\.com/' /etc/apt/sources.list \
    && apt-get update \
# Miscellaneous deps
    && apt-get install -y --no-install-recommends curl gnupg git ca-certificates \
# PHP
    && apt-get install -y --no-install-recommends php php-curl php-iconv php-mbstring php-bcmath \
# Node
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
# Python 3
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && pip3 install 'idna==2.9' --force-reinstall \
    && pip3 install --upgrade setuptools \
    && pip3 install tox \
# Installs as a local Node & Python module, so that `require ('ccxt')` and `import ccxt` should work after that
    && npm install \
    && ln -s /ccxt /usr/lib/node_modules/ \
    && echo "export NODE_PATH=/usr/lib/node_modules" >> $HOME/.bashrc \
    && cd python \
    && python3 setup.py develop \
    && cd .. \
## Remove apt sources
    && apt-get -y autoremove && apt-get clean && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
