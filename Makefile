.PHONY:	all local cloud api1 copy.css templates tsc eslint stylelint

all:	local cloud api1

node_modules:
	time npm install

local:	copy.css templates stylelint eslint tsc
	time npm run local

cloud:	copy.css templates stylelint eslint tsc
	time npm run cloud

api1:	copy.css templates stylelint eslint tsc
	time npm run api1

copy.css:
	time npm run copy.css

templates:
	time npm run templates

tsc:
	time npm run tsc

eslint:
	time npm run eslint

stylelint:
	time npm run stylelint
