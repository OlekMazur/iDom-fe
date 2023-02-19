.PHONY:	all local cloud api1 copy.css vue2js tsc eslint stylelint

all:	local cloud api1

node_modules:
	time npm install

local:	output/local/index.html copy.css vue2js stylelint eslint tsc
	time npm run local

cloud:	output/cloud/index.html copy.css vue2js stylelint eslint tsc
	time npm run cloud

api1:	output/api1/index.html copy.css vue2js stylelint eslint tsc
	time npm run api1

output/%/index.html:	src/%.html
	mkdir -p `dirname $@`
	install -m644 $< $@

copy.css:
	time npm run copy.css

vue2js:
	time npm run vue2js

tsc:
	time npm run tsc

eslint:
	time npm run eslint

stylelint:
	time npm run stylelint
