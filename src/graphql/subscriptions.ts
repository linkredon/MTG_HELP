/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../../lib/API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUser = /* GraphQL */ `subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
  onCreateUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
  onUpdateUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
  onDeleteUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateCollection = /* GraphQL */ `subscription OnCreateCollection(
  $filter: ModelSubscriptionCollectionFilterInput
) {
  onCreateCollection(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCollectionSubscriptionVariables,
  APITypes.OnCreateCollectionSubscription
>;
export const onUpdateCollection = /* GraphQL */ `subscription OnUpdateCollection(
  $filter: ModelSubscriptionCollectionFilterInput
) {
  onUpdateCollection(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCollectionSubscriptionVariables,
  APITypes.OnUpdateCollectionSubscription
>;
export const onDeleteCollection = /* GraphQL */ `subscription OnDeleteCollection(
  $filter: ModelSubscriptionCollectionFilterInput
) {
  onDeleteCollection(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCollectionSubscriptionVariables,
  APITypes.OnDeleteCollectionSubscription
>;
export const onCreateCollectionCard = /* GraphQL */ `subscription OnCreateCollectionCard(
  $filter: ModelSubscriptionCollectionCardFilterInput
) {
  onCreateCollectionCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCollectionCardSubscriptionVariables,
  APITypes.OnCreateCollectionCardSubscription
>;
export const onUpdateCollectionCard = /* GraphQL */ `subscription OnUpdateCollectionCard(
  $filter: ModelSubscriptionCollectionCardFilterInput
) {
  onUpdateCollectionCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCollectionCardSubscriptionVariables,
  APITypes.OnUpdateCollectionCardSubscription
>;
export const onDeleteCollectionCard = /* GraphQL */ `subscription OnDeleteCollectionCard(
  $filter: ModelSubscriptionCollectionCardFilterInput
) {
  onDeleteCollectionCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCollectionCardSubscriptionVariables,
  APITypes.OnDeleteCollectionCardSubscription
>;
export const onCreateDeck = /* GraphQL */ `subscription OnCreateDeck($filter: ModelSubscriptionDeckFilterInput) {
  onCreateDeck(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDeckSubscriptionVariables,
  APITypes.OnCreateDeckSubscription
>;
export const onUpdateDeck = /* GraphQL */ `subscription OnUpdateDeck($filter: ModelSubscriptionDeckFilterInput) {
  onUpdateDeck(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDeckSubscriptionVariables,
  APITypes.OnUpdateDeckSubscription
>;
export const onDeleteDeck = /* GraphQL */ `subscription OnDeleteDeck($filter: ModelSubscriptionDeckFilterInput) {
  onDeleteDeck(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDeckSubscriptionVariables,
  APITypes.OnDeleteDeckSubscription
>;
export const onCreateDeckCard = /* GraphQL */ `subscription OnCreateDeckCard($filter: ModelSubscriptionDeckCardFilterInput) {
  onCreateDeckCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDeckCardSubscriptionVariables,
  APITypes.OnCreateDeckCardSubscription
>;
export const onUpdateDeckCard = /* GraphQL */ `subscription OnUpdateDeckCard($filter: ModelSubscriptionDeckCardFilterInput) {
  onUpdateDeckCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDeckCardSubscriptionVariables,
  APITypes.OnUpdateDeckCardSubscription
>;
export const onDeleteDeckCard = /* GraphQL */ `subscription OnDeleteDeckCard($filter: ModelSubscriptionDeckCardFilterInput) {
  onDeleteDeckCard(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDeckCardSubscriptionVariables,
  APITypes.OnDeleteDeckCardSubscription
>;
export const onCreateFavorite = /* GraphQL */ `subscription OnCreateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
  onCreateFavorite(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateFavoriteSubscriptionVariables,
  APITypes.OnCreateFavoriteSubscription
>;
export const onUpdateFavorite = /* GraphQL */ `subscription OnUpdateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
  onUpdateFavorite(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateFavoriteSubscriptionVariables,
  APITypes.OnUpdateFavoriteSubscription
>;
export const onDeleteFavorite = /* GraphQL */ `subscription OnDeleteFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
  onDeleteFavorite(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteFavoriteSubscriptionVariables,
  APITypes.OnDeleteFavoriteSubscription
>;
