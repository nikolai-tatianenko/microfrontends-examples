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

export type DashboardQueryVariables = Exact<{
  activityLimit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DashboardQuery = { __typename?: 'Query', stats: Array<{ __typename?: 'Stat', id: string, label: string, value: string, deltaPct: number }>, recentActivity: Array<{ __typename?: 'Activity', id: string, user: string, action: string, at: string }> };


export const DashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activityLimit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"deltaPct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activityLimit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"at"}}]}}]}}]} as unknown as DocumentNode<DashboardQuery, DashboardQueryVariables>;