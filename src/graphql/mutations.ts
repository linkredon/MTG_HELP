/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../../lib/API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createCollection = /* GraphQL */ `mutation CreateCollection(
  $input: CreateCollectionInput!
  $condition: ModelCollectionConditionInput
) {
  createCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCollectionMutationVariables,
  APITypes.CreateCollectionMutation
>;
export const updateCollection = /* GraphQL */ `mutation UpdateCollection(
  $input: UpdateCollectionInput!
  $condition: ModelCollectionConditionInput
) {
  updateCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCollectionMutationVariables,
  APITypes.UpdateCollectionMutation
>;
export const deleteCollection = /* GraphQL */ `mutation DeleteCollection(
  $input: DeleteCollectionInput!
  $condition: ModelCollectionConditionInput
) {
  deleteCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCollectionMutationVariables,
  APITypes.DeleteCollectionMutation
>;
export const createCollectionCard = /* GraphQL */ `mutation CreateCollectionCard(
  $input: CreateCollectionCardInput!
  $condition: ModelCollectionCardConditionInput
) {
  createCollectionCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateCollectionCardMutationVariables,
  APITypes.CreateCollectionCardMutation
>;
export const updateCollectionCard = /* GraphQL */ `mutation UpdateCollectionCard(
  $input: UpdateCollectionCardInput!
  $condition: ModelCollectionCardConditionInput
) {
  updateCollectionCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateCollectionCardMutationVariables,
  APITypes.UpdateCollectionCardMutation
>;
export const deleteCollectionCard = /* GraphQL */ `mutation DeleteCollectionCard(
  $input: DeleteCollectionCardInput!
  $condition: ModelCollectionCardConditionInput
) {
  deleteCollectionCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteCollectionCardMutationVariables,
  APITypes.DeleteCollectionCardMutation
>;
export const createDeck = /* GraphQL */ `mutation CreateDeck(
  $input: CreateDeckInput!
  $condition: ModelDeckConditionInput
) {
  createDeck(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateDeckMutationVariables,
  APITypes.CreateDeckMutation
>;
export const updateDeck = /* GraphQL */ `mutation UpdateDeck(
  $input: UpdateDeckInput!
  $condition: ModelDeckConditionInput
) {
  updateDeck(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateDeckMutationVariables,
  APITypes.UpdateDeckMutation
>;
export const deleteDeck = /* GraphQL */ `mutation DeleteDeck(
  $input: DeleteDeckInput!
  $condition: ModelDeckConditionInput
) {
  deleteDeck(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteDeckMutationVariables,
  APITypes.DeleteDeckMutation
>;
export const createDeckCard = /* GraphQL */ `mutation CreateDeckCard(
  $input: CreateDeckCardInput!
  $condition: ModelDeckCardConditionInput
) {
  createDeckCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateDeckCardMutationVariables,
  APITypes.CreateDeckCardMutation
>;
export const updateDeckCard = /* GraphQL */ `mutation UpdateDeckCard(
  $input: UpdateDeckCardInput!
  $condition: ModelDeckCardConditionInput
) {
  updateDeckCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateDeckCardMutationVariables,
  APITypes.UpdateDeckCardMutation
>;
export const deleteDeckCard = /* GraphQL */ `mutation DeleteDeckCard(
  $input: DeleteDeckCardInput!
  $condition: ModelDeckCardConditionInput
) {
  deleteDeckCard(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteDeckCardMutationVariables,
  APITypes.DeleteDeckCardMutation
>;
export const createFavorite = /* GraphQL */ `mutation CreateFavorite(
  $input: CreateFavoriteInput!
  $condition: ModelFavoriteConditionInput
) {
  createFavorite(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateFavoriteMutationVariables,
  APITypes.CreateFavoriteMutation
>;
export const updateFavorite = /* GraphQL */ `mutation UpdateFavorite(
  $input: UpdateFavoriteInput!
  $condition: ModelFavoriteConditionInput
) {
  updateFavorite(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateFavoriteMutationVariables,
  APITypes.UpdateFavoriteMutation
>;
export const deleteFavorite = /* GraphQL */ `mutation DeleteFavorite(
  $input: DeleteFavoriteInput!
  $condition: ModelFavoriteConditionInput
) {
  deleteFavorite(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteFavoriteMutationVariables,
  APITypes.DeleteFavoriteMutation
>;
