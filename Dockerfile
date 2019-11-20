FROM ubuntu:18.04

# Supresses unwanted user interaction (like "Please select the geographic area" when installing tzdata)
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /ccxt

# Install system dependencies & Update packages (use us.archive.ubuntu.com instead of archive.ubuntu.com — solves the painfully slow apt-get update)
RUN sed -i 's/archive\.ubuntu\.com/us\.archive\.ubuntu\.com/' /etc/apt/sources.list \
    && apt-get update \
# Miscellaneous deps
    && apt-get -y install curl gnupg git pandoc \
# PHP
    && apt-get install -y php php-curl php-iconv php-mbstring php-bcmath \
# Node
    && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
    && apt-get -y install nodejs \
    && ln -s /ccxt /usr/lib/node_modules \
    && echo "export NODE_PATH=/usr/lib/node_modules" >> $HOME/.bashrc \
# Python 2
    && apt-get install -y python-pip \
    && pip2 install --upgrade setuptools \
    && pip2 install tox \
# Python 3
    && apt-get install -y python3 python3-pip \
    && pip3 install --upgrade setuptools \
    && pip3 install tox \
## Remove apt sources
    && apt-get -y autoremove && apt-get clean && apt-get autoclean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ["package.json", "package-lock.json", "/ccxt/"]
RUN npm install

COPY ["python/setup.py", "python/setup.cfg", "python/README.rst", "/ccxt/python/"]
RUN cd python \
    && python3 setup.py develop \
    && python setup.py develop \
    && cd ..

COPY . .
