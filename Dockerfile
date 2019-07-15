FROM ubuntu:18.04

# Supresses unwanted user interaction (like "Please select the geographic area" when installing tzdata)
ENV DEBIAN_FRONTEND=noninteractive

ADD . /ccxt
WORKDIR /ccxt

# Update packages (use us.archive.ubuntu.com instead of archive.ubuntu.com — solves the painfully slow apt-get update)
RUN sed -i 's/archive\.ubuntu\.com/us\.archive\.ubuntu\.com/' /etc/apt/sources.list \
    && apt-get update \
# Miscellaneous deps
    && apt-get -y install curl gnupg git pandoc \
# PHP
    && apt-get install -y php php-curl php-iconv php-mbstring php-bcmath \
# Node
    && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
    && apt-get -y install nodejs \
# Python 2
    && apt-get install -y python-pip \
    && pip2 install --upgrade setuptools \
# Python 3
    && apt-get install -y python3 python3-pip \
    && pip3 install --upgrade setuptools \
# Copy files to workdir to && install scripts against it (will be replaced with a live-mounted volume at startup)
&& mkdir -p /ccxt \
&& rm -rf /ccxt/node_modules \
# Installs as a local Node & Python module, so that `require ('ccxt')` and `import ccxt` should work after that
    && npm install \
    && ln -s /ccxt /usr/lib/node_modules/ \
    && echo "export NODE_PATH=/usr/lib/node_modules" >> $HOME/.bashrc \
    && cd python && python3 setup.py install && python setup.py install && cd .. \
## Remove apt sources
    && apt-get -y autoremove && apt-get clean && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
