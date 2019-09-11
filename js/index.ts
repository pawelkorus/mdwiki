import $ from 'jquery';
// @ts-ignore
window.jQuery = $;
// @ts-ignore
window.$ = $;
import Handlebars from 'handlebars';
// @ts-ignore
window.Handlebars = Handlebars;

import 'jquery-colorbox';
import 'bootstrap';

import './ts/globals';
import './init';
//import './marked';

import '../tmp/MDWiki.templates';
import './ts/basic_skeleton';
//import './ts/utils';
//import './ts/template';
import './ts/bootstrap';
//import './ts/gimmickparser';
//import './ts/gimmickloader';
import './ts/jsxRender';
//import './ts/LinkRewriter';
//import './ts/logger';
import './ts/main';
import './ts/markdown';
import './ts/navigationmodel';
//import './ts/stage';
import './ts/theme';
import './ts/wiki';

import './main';

import './gimmicks/templating';
import './gimmicks/prism';

import '../styles/main.scss';
import '../styles/mdwiki.css';
import '../extlib/css/colorbox.css';