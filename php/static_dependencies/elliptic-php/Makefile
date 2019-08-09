all: test bench coverage

test:
	vendor/bin/phpunit --testdox

bench:
	vendor/bin/phpbench run --report=simple

coverage:
	sudo php5enmod xdebug
	vendor/bin/phpunit --coverage-html=coverage
	sudo php5dismod xdebug
	xdg-open coverage/index.html
