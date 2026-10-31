/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Activity = {
  __typename?: 'Activity';
  action: Scalars['String']['output'];
  at: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  user: Scalars['String']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  email: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  signIn: AuthPayload;
  signUp: AuthPayload;
};


export type MutationSignInArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignUpArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Plan = {
  __typename?: 'Plan';
  features: Array<Scalars['String']['output']>;
  highlighted: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  priceUsd: Scalars['Int']['output'];
};

export type Post = {
  __typename?: 'Post';
  body: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _authPing: Scalars['Boolean']['output'];
  plans: Array<Plan>;
  posts: Array<Post>;
  recentActivity: Array<Activity>;
  stats: Array<Stat>;
};


export type QueryPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRecentActivityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type Stat = {
  __typename?: 'Stat';
  deltaPct: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type PostsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PostsQuery = { __typename?: 'Query', posts: Array<{ __typename?: 'Post', id: string, title: string, body: string, imageUrl: string }> };

export type PlansQueryVariables = Exact<{ [key: string]: never; }>;


export type PlansQuery = { __typename?: 'Query', plans: Array<{ __typename?: 'Plan', id: string, name: string, priceUsd: number, features: Array<string>, highlighted: boolean }> };


export const PostsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Posts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"posts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<PostsQuery, PostsQueryVariables>;
export const PlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Plans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"priceUsd"}},{"kind":"Field","name":{"kind":"Name","value":"features"}},{"kind":"Field","name":{"kind":"Name","value":"highlighted"}}]}}]}}]} as unknown as DocumentNode<PlansQuery, PlansQueryVariables>;