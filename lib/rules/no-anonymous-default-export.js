'use strict';




var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _has = require('has');var _has2 = _interopRequireDefault(_has);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} /**
                                                                                                                                                                    * @fileoverview Rule to disallow anonymous default exports.
                                                                                                                                                                    * @author Duncan Beevers
                                                                                                                                                                    */var defs = { ArrayExpression: {
    option: 'allowArray',
    description: 'If `false`, will report default export of an array',
    message: 'Assign array to a variable before exporting as module default' },

  ArrowFunctionExpression: {
    option: 'allowArrowFunction',
    description: 'If `false`, will report default export of an arrow function',
    message: 'Assign arrow function to a variable before exporting as module default' },

  CallExpression: {
    option: 'allowCallExpression',
    description: 'If `false`, will report default export of a function call',
    message: 'Assign call result to a variable before exporting as module default',
    'default': true },

  ClassDeclaration: {
    option: 'allowAnonymousClass',
    description: 'If `false`, will report default export of an anonymous class',
    message: 'Unexpected default export of anonymous class',
    forbid: function () {function forbid(node) {return !node.declaration.id;}return forbid;}() },

  FunctionDeclaration: {
    option: 'allowAnonymousFunction',
    description: 'If `false`, will report default export of an anonymous function',
    message: 'Unexpected default export of anonymous function',
    forbid: function () {function forbid(node) {return !node.declaration.id;}return forbid;}() },

  Literal: {
    option: 'allowLiteral',
    description: 'If `false`, will report default export of a literal',
    message: 'Assign literal to a variable before exporting as module default' },

  ObjectExpression: {
    option: 'allowObject',
    description: 'If `false`, will report default export of an object expression',
    message: 'Assign object to a variable before exporting as module default' },

  TemplateLiteral: {
    option: 'allowLiteral',
    description: 'If `false`, will report default export of a literal',
    message: 'Assign literal to a variable before exporting as module default' },

  NewExpression: {
    option: 'allowNew',
    description: 'If `false`, will report default export of a class instantiation',
    message: 'Assign instance to a variable before exporting as module default' } };



var schemaProperties = Object.keys(defs).
map(function (key) {return defs[key];}).
reduce(function (acc, def) {
  acc[def.option] = {
    description: def.description,
    type: 'boolean' };


  return acc;
}, {});

var defaults = Object.keys(defs).
map(function (key) {return defs[key];}).
reduce(function (acc, def) {
  acc[def.option] = (0, _has2['default'])(def, 'default') ? def['default'] : false;
  return acc;
}, {});

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2['default'])('no-anonymous-default-export') },


    schema: [
    {
      type: 'object',
      properties: schemaProperties,
      'additionalProperties': false }] },




  create: function () {function create(context) {
      var options = Object.assign({}, defaults, context.options[0]);

      return {
        'ExportDefaultDeclaration': function () {function ExportDefaultDeclaration(node) {
            var def = defs[node.declaration.type];

            // Recognized node type and allowed by configuration,
            //   and has no forbid check, or forbid check return value is truthy
            if (def && !options[def.option] && (!def.forbid || def.forbid(node))) {
              context.report({ node: node, message: def.message });
            }
          }return ExportDefaultDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hbm9ueW1vdXMtZGVmYXVsdC1leHBvcnQuanMiXSwibmFtZXMiOlsiZGVmcyIsIkFycmF5RXhwcmVzc2lvbiIsIm9wdGlvbiIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsIkFycm93RnVuY3Rpb25FeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJDbGFzc0RlY2xhcmF0aW9uIiwiZm9yYmlkIiwibm9kZSIsImRlY2xhcmF0aW9uIiwiaWQiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiTGl0ZXJhbCIsIk9iamVjdEV4cHJlc3Npb24iLCJUZW1wbGF0ZUxpdGVyYWwiLCJOZXdFeHByZXNzaW9uIiwic2NoZW1hUHJvcGVydGllcyIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJrZXkiLCJyZWR1Y2UiLCJhY2MiLCJkZWYiLCJ0eXBlIiwiZGVmYXVsdHMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiY3JlYXRlIiwiY29udGV4dCIsIm9wdGlvbnMiLCJhc3NpZ24iLCJyZXBvcnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EscUM7QUFDQSwwQix5SUFOQTs7O3NLQVFBLElBQU1BLE9BQU8sRUFDWEMsaUJBQWlCO0FBQ2ZDLFlBQVEsWUFETztBQUVmQyxpQkFBYSxvREFGRTtBQUdmQyxhQUFTLCtEQUhNLEVBRE47O0FBTVhDLDJCQUF5QjtBQUN2QkgsWUFBUSxvQkFEZTtBQUV2QkMsaUJBQWEsNkRBRlU7QUFHdkJDLGFBQVMsd0VBSGMsRUFOZDs7QUFXWEUsa0JBQWdCO0FBQ2RKLFlBQVEscUJBRE07QUFFZEMsaUJBQWEsMkRBRkM7QUFHZEMsYUFBUyxxRUFISztBQUlkLGVBQVMsSUFKSyxFQVhMOztBQWlCWEcsb0JBQWtCO0FBQ2hCTCxZQUFRLHFCQURRO0FBRWhCQyxpQkFBYSw4REFGRztBQUdoQkMsYUFBUyw4Q0FITztBQUloQkkseUJBQVEsZ0JBQUNDLElBQUQsVUFBVSxDQUFDQSxLQUFLQyxXQUFMLENBQWlCQyxFQUE1QixFQUFSLGlCQUpnQixFQWpCUDs7QUF1QlhDLHVCQUFxQjtBQUNuQlYsWUFBUSx3QkFEVztBQUVuQkMsaUJBQWEsaUVBRk07QUFHbkJDLGFBQVMsaURBSFU7QUFJbkJJLHlCQUFRLGdCQUFDQyxJQUFELFVBQVUsQ0FBQ0EsS0FBS0MsV0FBTCxDQUFpQkMsRUFBNUIsRUFBUixpQkFKbUIsRUF2QlY7O0FBNkJYRSxXQUFTO0FBQ1BYLFlBQVEsY0FERDtBQUVQQyxpQkFBYSxxREFGTjtBQUdQQyxhQUFTLGlFQUhGLEVBN0JFOztBQWtDWFUsb0JBQWtCO0FBQ2hCWixZQUFRLGFBRFE7QUFFaEJDLGlCQUFhLGdFQUZHO0FBR2hCQyxhQUFTLGdFQUhPLEVBbENQOztBQXVDWFcsbUJBQWlCO0FBQ2ZiLFlBQVEsY0FETztBQUVmQyxpQkFBYSxxREFGRTtBQUdmQyxhQUFTLGlFQUhNLEVBdkNOOztBQTRDWFksaUJBQWU7QUFDYmQsWUFBUSxVQURLO0FBRWJDLGlCQUFhLGlFQUZBO0FBR2JDLGFBQVMsa0VBSEksRUE1Q0osRUFBYjs7OztBQW1EQSxJQUFNYSxtQkFBbUJDLE9BQU9DLElBQVAsQ0FBWW5CLElBQVo7QUFDdEJvQixHQURzQixDQUNsQixVQUFDQyxHQUFELFVBQVNyQixLQUFLcUIsR0FBTCxDQUFULEVBRGtCO0FBRXRCQyxNQUZzQixDQUVmLFVBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3BCRCxNQUFJQyxJQUFJdEIsTUFBUixJQUFrQjtBQUNoQkMsaUJBQWFxQixJQUFJckIsV0FERDtBQUVoQnNCLFVBQU0sU0FGVSxFQUFsQjs7O0FBS0EsU0FBT0YsR0FBUDtBQUNELENBVHNCLEVBU3BCLEVBVG9CLENBQXpCOztBQVdBLElBQU1HLFdBQVdSLE9BQU9DLElBQVAsQ0FBWW5CLElBQVo7QUFDZG9CLEdBRGMsQ0FDVixVQUFDQyxHQUFELFVBQVNyQixLQUFLcUIsR0FBTCxDQUFULEVBRFU7QUFFZEMsTUFGYyxDQUVQLFVBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFjO0FBQ3BCRCxNQUFJQyxJQUFJdEIsTUFBUixJQUFrQixzQkFBSXNCLEdBQUosRUFBUyxTQUFULElBQXNCQSxjQUF0QixHQUFvQyxLQUF0RDtBQUNBLFNBQU9ELEdBQVA7QUFDRCxDQUxjLEVBS1osRUFMWSxDQUFqQjs7QUFPQUksT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pKLFVBQU0sWUFERjtBQUVKSyxVQUFNO0FBQ0pDLFdBQUssMEJBQVEsNkJBQVIsQ0FERCxFQUZGOzs7QUFNSkMsWUFBUTtBQUNOO0FBQ0VQLFlBQU0sUUFEUjtBQUVFUSxrQkFBWWhCLGdCQUZkO0FBR0UsOEJBQXdCLEtBSDFCLEVBRE0sQ0FOSixFQURTOzs7OztBQWdCZmlCLFFBaEJlLCtCQWdCUkMsT0FoQlEsRUFnQkM7QUFDZCxVQUFNQyxVQUFVbEIsT0FBT21CLE1BQVAsQ0FBYyxFQUFkLEVBQWtCWCxRQUFsQixFQUE0QlMsUUFBUUMsT0FBUixDQUFnQixDQUFoQixDQUE1QixDQUFoQjs7QUFFQSxhQUFPO0FBQ0wsaURBQTRCLGtDQUFDM0IsSUFBRCxFQUFVO0FBQ3BDLGdCQUFNZSxNQUFNeEIsS0FBS1MsS0FBS0MsV0FBTCxDQUFpQmUsSUFBdEIsQ0FBWjs7QUFFQTtBQUNBO0FBQ0EsZ0JBQUlELE9BQU8sQ0FBQ1ksUUFBUVosSUFBSXRCLE1BQVosQ0FBUixLQUFnQyxDQUFDc0IsSUFBSWhCLE1BQUwsSUFBZWdCLElBQUloQixNQUFKLENBQVdDLElBQVgsQ0FBL0MsQ0FBSixFQUFzRTtBQUNwRTBCLHNCQUFRRyxNQUFSLENBQWUsRUFBRTdCLFVBQUYsRUFBUUwsU0FBU29CLElBQUlwQixPQUFyQixFQUFmO0FBQ0Q7QUFDRixXQVJELG1DQURLLEVBQVA7O0FBV0QsS0E5QmMsbUJBQWpCIiwiZmlsZSI6Im5vLWFub255bW91cy1kZWZhdWx0LWV4cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIGRpc2FsbG93IGFub255bW91cyBkZWZhdWx0IGV4cG9ydHMuXG4gKiBAYXV0aG9yIER1bmNhbiBCZWV2ZXJzXG4gKi9cblxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5pbXBvcnQgaGFzIGZyb20gJ2hhcyc7XG5cbmNvbnN0IGRlZnMgPSB7XG4gIEFycmF5RXhwcmVzc2lvbjoge1xuICAgIG9wdGlvbjogJ2FsbG93QXJyYXknLFxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYW4gYXJyYXknLFxuICAgIG1lc3NhZ2U6ICdBc3NpZ24gYXJyYXkgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcbiAgfSxcbiAgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246IHtcbiAgICBvcHRpb246ICdhbGxvd0Fycm93RnVuY3Rpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYW4gYXJyb3cgZnVuY3Rpb24nLFxuICAgIG1lc3NhZ2U6ICdBc3NpZ24gYXJyb3cgZnVuY3Rpb24gdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcbiAgfSxcbiAgQ2FsbEV4cHJlc3Npb246IHtcbiAgICBvcHRpb246ICdhbGxvd0NhbGxFeHByZXNzaW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGEgZnVuY3Rpb24gY2FsbCcsXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBjYWxsIHJlc3VsdCB0byBhIHZhcmlhYmxlIGJlZm9yZSBleHBvcnRpbmcgYXMgbW9kdWxlIGRlZmF1bHQnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gIH0sXG4gIENsYXNzRGVjbGFyYXRpb246IHtcbiAgICBvcHRpb246ICdhbGxvd0Fub255bW91c0NsYXNzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGFuIGFub255bW91cyBjbGFzcycsXG4gICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgZGVmYXVsdCBleHBvcnQgb2YgYW5vbnltb3VzIGNsYXNzJyxcbiAgICBmb3JiaWQ6IChub2RlKSA9PiAhbm9kZS5kZWNsYXJhdGlvbi5pZCxcbiAgfSxcbiAgRnVuY3Rpb25EZWNsYXJhdGlvbjoge1xuICAgIG9wdGlvbjogJ2FsbG93QW5vbnltb3VzRnVuY3Rpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYW4gYW5vbnltb3VzIGZ1bmN0aW9uJyxcbiAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBkZWZhdWx0IGV4cG9ydCBvZiBhbm9ueW1vdXMgZnVuY3Rpb24nLFxuICAgIGZvcmJpZDogKG5vZGUpID0+ICFub2RlLmRlY2xhcmF0aW9uLmlkLFxuICB9LFxuICBMaXRlcmFsOiB7XG4gICAgb3B0aW9uOiAnYWxsb3dMaXRlcmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGEgbGl0ZXJhbCcsXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBsaXRlcmFsIHRvIGEgdmFyaWFibGUgYmVmb3JlIGV4cG9ydGluZyBhcyBtb2R1bGUgZGVmYXVsdCcsXG4gIH0sXG4gIE9iamVjdEV4cHJlc3Npb246IHtcbiAgICBvcHRpb246ICdhbGxvd09iamVjdCcsXG4gICAgZGVzY3JpcHRpb246ICdJZiBgZmFsc2VgLCB3aWxsIHJlcG9ydCBkZWZhdWx0IGV4cG9ydCBvZiBhbiBvYmplY3QgZXhwcmVzc2lvbicsXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBvYmplY3QgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcbiAgfSxcbiAgVGVtcGxhdGVMaXRlcmFsOiB7XG4gICAgb3B0aW9uOiAnYWxsb3dMaXRlcmFsJyxcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGEgbGl0ZXJhbCcsXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBsaXRlcmFsIHRvIGEgdmFyaWFibGUgYmVmb3JlIGV4cG9ydGluZyBhcyBtb2R1bGUgZGVmYXVsdCcsXG4gIH0sXG4gIE5ld0V4cHJlc3Npb246IHtcbiAgICBvcHRpb246ICdhbGxvd05ldycsXG4gICAgZGVzY3JpcHRpb246ICdJZiBgZmFsc2VgLCB3aWxsIHJlcG9ydCBkZWZhdWx0IGV4cG9ydCBvZiBhIGNsYXNzIGluc3RhbnRpYXRpb24nLFxuICAgIG1lc3NhZ2U6ICdBc3NpZ24gaW5zdGFuY2UgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcbiAgfSxcbn07XG5cbmNvbnN0IHNjaGVtYVByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhkZWZzKVxuICAubWFwKChrZXkpID0+IGRlZnNba2V5XSlcbiAgLnJlZHVjZSgoYWNjLCBkZWYpID0+IHtcbiAgICBhY2NbZGVmLm9wdGlvbl0gPSB7XG4gICAgICBkZXNjcmlwdGlvbjogZGVmLmRlc2NyaXB0aW9uLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIH07XG5cbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG5cbmNvbnN0IGRlZmF1bHRzID0gT2JqZWN0LmtleXMoZGVmcylcbiAgLm1hcCgoa2V5KSA9PiBkZWZzW2tleV0pXG4gIC5yZWR1Y2UoKGFjYywgZGVmKSA9PiB7XG4gICAgYWNjW2RlZi5vcHRpb25dID0gaGFzKGRlZiwgJ2RlZmF1bHQnKSA/IGRlZi5kZWZhdWx0IDogZmFsc2U7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcbiAgICBkb2NzOiB7XG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWFub255bW91cy1kZWZhdWx0LWV4cG9ydCcpLFxuICAgIH0sXG5cbiAgICBzY2hlbWE6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHByb3BlcnRpZXM6IHNjaGVtYVByb3BlcnRpZXMsXG4gICAgICAgICdhZGRpdGlvbmFsUHJvcGVydGllcyc6IGZhbHNlLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXG4gIGNyZWF0ZShjb250ZXh0KSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBjb250ZXh0Lm9wdGlvbnNbMF0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiAobm9kZSkgPT4ge1xuICAgICAgICBjb25zdCBkZWYgPSBkZWZzW25vZGUuZGVjbGFyYXRpb24udHlwZV07XG5cbiAgICAgICAgLy8gUmVjb2duaXplZCBub2RlIHR5cGUgYW5kIGFsbG93ZWQgYnkgY29uZmlndXJhdGlvbixcbiAgICAgICAgLy8gICBhbmQgaGFzIG5vIGZvcmJpZCBjaGVjaywgb3IgZm9yYmlkIGNoZWNrIHJldHVybiB2YWx1ZSBpcyB0cnV0aHlcbiAgICAgICAgaWYgKGRlZiAmJiAhb3B0aW9uc1tkZWYub3B0aW9uXSAmJiAoIWRlZi5mb3JiaWQgfHwgZGVmLmZvcmJpZChub2RlKSkpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IGRlZi5tZXNzYWdlIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19