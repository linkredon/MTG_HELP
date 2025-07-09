/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../../lib/API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    name
    email
    avatar
    role
    joinedAt
    collectionsCount
    totalCards
    achievements
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      email
      avatar
      role
      joinedAt
      collectionsCount
      totalCards
      achievements
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const getCollection = /* GraphQL */ `query GetCollection($id: ID!) {
  getCollection(id: $id) {
    id
    name
    description
    isPublic
    backgroundImage
    createdAt
    updatedAt
    userID
    user {
      id
      name
      email
      avatar
      role
      joinedAt
      collectionsCount
      totalCards
      achievements
      createdAt
      updatedAt
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCollectionQueryVariables,
  APITypes.GetCollectionQuery
>;
export const listCollections = /* GraphQL */ `query ListCollections(
  $filter: ModelCollectionFilterInput
  $limit: Int
  $nextToken: String
) {
  listCollections(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      description
      isPublic
      backgroundImage
      createdAt
      updatedAt
      userID
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCollectionsQueryVariables,
  APITypes.ListCollectionsQuery
>;
export const getCollectionCard = /* GraphQL */ `query GetCollectionCard($id: ID!) {
  getCollectionCard(id: $id) {
    id
    cardId
    cardData
    quantity
    condition
    foil
    language
    collectionID
    collection {
      id
      name
      description
      isPublic
      backgroundImage
      createdAt
      updatedAt
      userID
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCollectionCardQueryVariables,
  APITypes.GetCollectionCardQuery
>;
export const listCollectionCards = /* GraphQL */ `query ListCollectionCards(
  $filter: ModelCollectionCardFilterInput
  $limit: Int
  $nextToken: String
) {
  listCollectionCards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      cardId
      cardData
      quantity
      condition
      foil
      language
      collectionID
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCollectionCardsQueryVariables,
  APITypes.ListCollectionCardsQuery
>;
export const getDeck = /* GraphQL */ `query GetDeck($id: ID!) {
  getDeck(id: $id) {
    id
    name
    format
    colors
    description
    isPublic
    tags
    createdAt
    lastModified
    userID
    user {
      id
      name
      email
      avatar
      role
      joinedAt
      collectionsCount
      totalCards
      achievements
      createdAt
      updatedAt
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetDeckQueryVariables, APITypes.GetDeckQuery>;
export const listDecks = /* GraphQL */ `query ListDecks(
  $filter: ModelDeckFilterInput
  $limit: Int
  $nextToken: String
) {
  listDecks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      format
      colors
      description
      isPublic
      tags
      createdAt
      lastModified
      userID
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListDecksQueryVariables, APITypes.ListDecksQuery>;
export const getDeckCard = /* GraphQL */ `query GetDeckCard($id: ID!) {
  getDeckCard(id: $id) {
    id
    cardId
    cardData
    quantity
    category
    deckID
    deck {
      id
      name
      format
      colors
      description
      isPublic
      tags
      createdAt
      lastModified
      userID
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDeckCardQueryVariables,
  APITypes.GetDeckCardQuery
>;
export const listDeckCards = /* GraphQL */ `query ListDeckCards(
  $filter: ModelDeckCardFilterInput
  $limit: Int
  $nextToken: String
) {
  listDeckCards(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      cardId
      cardData
      quantity
      category
      deckID
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDeckCardsQueryVariables,
  APITypes.ListDeckCardsQuery
>;
export const getFavorite = /* GraphQL */ `query GetFavorite($id: ID!) {
  getFavorite(id: $id) {
    id
    cardId
    cardData
    addedAt
    userID
    user {
      id
      name
      email
      avatar
      role
      joinedAt
      collectionsCount
      totalCards
      achievements
      createdAt
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFavoriteQueryVariables,
  APITypes.GetFavoriteQuery
>;
export const listFavorites = /* GraphQL */ `query ListFavorites(
  $filter: ModelFavoriteFilterInput
  $limit: Int
  $nextToken: String
) {
  listFavorites(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      cardId
      cardData
      addedAt
      userID
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFavoritesQueryVariables,
  APITypes.ListFavoritesQuery
>;
