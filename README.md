[![Build](https://github.com/OlekMazur/iDom-fe/actions/workflows/makefile.yml/badge.svg)](https://github.com/OlekMazur/iDom-fe/actions/workflows/makefile.yml)

Frontend for yet another home automation system
===============================================

This is a GUI for home automation system, written in TypeScript,
based on Vue.js version 2.

![img]

Three variants are built out of the same source:

**local** variant
-----------------
Uses FastCGI backend.

**cloud** variant
-----------------
Uses Firebase cloud service.

Needs appropriate credentials in [cloud setup file].

**api1** variant
----------------
Uses PHP service backed by PostgreSQL database.

License
=======

This file is part of iDom-fe.

iDom-fe is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

iDom-fe is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License for more details.

You should have received a copy of the [GNU General Public License]
along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.

[GNU General Public License]: LICENSE.md
[img]: img/iDom-fe.png
[cloud setup file]: src/data/cloud/Setup.ts
