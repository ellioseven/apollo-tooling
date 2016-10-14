import { expect } from 'chai';

import { stripIndent } from 'common-tags'

import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
} from 'graphql';

import { loadSchema } from '../../src/loading'
const schema = loadSchema(require.resolve('../starwars/schema.json'));

import CodeGenerator from '../../src/utilities/CodeGenerator';

import { typeNameFromGraphQLType, typeDeclarationForGraphQLType } from '../../src/swift/types'

describe('Swift code generation: Types', function() {
  describe('#typeNameFromGraphQLType()', function() {
    it('should return String? for GraphQLString', function() {
      expect(typeNameFromGraphQLType({}, GraphQLString)).to.equal('String?');
    });

    it('should return String for GraphQLNonNull(GraphQLString)', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLNonNull(GraphQLString))).to.equal('String');
    });

    it('should return [String?]? for GraphQLList(GraphQLString)', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLList(GraphQLString))).to.equal('[String?]?');
    });

    it('should return [String?] for GraphQLNonNull(GraphQLList(GraphQLString))', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLNonNull(new GraphQLList(GraphQLString)))).to.equal('[String?]');
    });

    it('should return [String]? for GraphQLList(GraphQLNonNull(GraphQLString))', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLList(new GraphQLNonNull(GraphQLString)))).to.equal('[String]?');
    });

    it('should return [String] for GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString)))', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))))).to.equal('[String]');
    });

    it('should return Int? for GraphQLInt', function() {
      expect(typeNameFromGraphQLType({}, GraphQLInt)).to.equal('Int?');
    });

    it('should return Float? for GraphQLFloat', function() {
      expect(typeNameFromGraphQLType({}, GraphQLFloat)).to.equal('Float?');
    });

    it('should return Bool? for GraphQLBoolean', function() {
      expect(typeNameFromGraphQLType({}, GraphQLBoolean)).to.equal('Bool?');
    });

    it('should return GraphQLID? for GraphQLID', function() {
      expect(typeNameFromGraphQLType({}, GraphQLID)).to.equal('GraphQLID?');
    });

    it('should return String? for a custom scalar type', function() {
      expect(typeNameFromGraphQLType({}, new GraphQLScalarType({ name: 'CustomScalarType', serialize: String }))).to.equal('String?');
    });

    it('should return a passed through custom scalar type with the passthroughCustomScalars option', function() {
      expect(typeNameFromGraphQLType({ passthroughCustomScalars: true }, new GraphQLScalarType({ name: 'CustomScalarType', serialize: String }))).to.equal('CustomScalarType?');
    });
  });

  describe('#typeDeclarationForGraphQLType()', function() {
    it('should generate an enum declaration for a GraphQLEnumType', function() {
      const generator = new CodeGenerator();

      typeDeclarationForGraphQLType(generator, schema.getType('Episode'));

      expect(generator.output).to.equal(stripIndent`
        /// The episodes in the Star Wars trilogy
        public enum Episode: String {
          case newhope = "NEWHOPE" /// Star Wars Episode IV: A New Hope, released in 1977.
          case empire = "EMPIRE" /// Star Wars Episode V: The Empire Strikes Back, released in 1980.
          case jedi = "JEDI" /// Star Wars Episode VI: Return of the Jedi, released in 1983.
        }

        extension Episode: JSONDecodable, JSONEncodable {}
      `);
    });
  });
});