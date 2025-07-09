/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateUserInput = {
  id?: string | null,
  name: string,
  email: string,
  avatar?: string | null,
  role?: string | null,
  joinedAt?: string | null,
  collectionsCount?: number | null,
  totalCards?: number | null,
  achievements?: Array< string | null > | null,
};

export type ModelUserConditionInput = {
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  avatar?: ModelStringInput | null,
  role?: ModelStringInput | null,
  joinedAt?: ModelStringInput | null,
  collectionsCount?: ModelIntInput | null,
  totalCards?: ModelIntInput | null,
  achievements?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type User = {
  __typename: "User",
  id: string,
  name: string,
  email: string,
  avatar?: string | null,
  role?: string | null,
  joinedAt?: string | null,
  collectionsCount?: number | null,
  totalCards?: number | null,
  achievements?: Array< string | null > | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateUserInput = {
  id: string,
  name?: string | null,
  email?: string | null,
  avatar?: string | null,
  role?: string | null,
  joinedAt?: string | null,
  collectionsCount?: number | null,
  totalCards?: number | null,
  achievements?: Array< string | null > | null,
};

export type DeleteUserInput = {
  id: string,
};

export type CreateCollectionInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  isPublic?: boolean | null,
  backgroundImage?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  userID: string,
};

export type ModelCollectionConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  isPublic?: ModelBooleanInput | null,
  backgroundImage?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  and?: Array< ModelCollectionConditionInput | null > | null,
  or?: Array< ModelCollectionConditionInput | null > | null,
  not?: ModelCollectionConditionInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type Collection = {
  __typename: "Collection",
  id: string,
  name: string,
  description?: string | null,
  isPublic?: boolean | null,
  backgroundImage?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  userID: string,
  user?: User | null,
};

export type UpdateCollectionInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  isPublic?: boolean | null,
  backgroundImage?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  userID?: string | null,
};

export type DeleteCollectionInput = {
  id: string,
};

export type CreateCollectionCardInput = {
  id?: string | null,
  cardId: string,
  cardData: string,
  quantity: number,
  condition?: string | null,
  foil?: boolean | null,
  language?: string | null,
  collectionID: string,
};

export type ModelCollectionCardConditionInput = {
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  condition?: ModelStringInput | null,
  foil?: ModelBooleanInput | null,
  language?: ModelStringInput | null,
  collectionID?: ModelIDInput | null,
  and?: Array< ModelCollectionCardConditionInput | null > | null,
  or?: Array< ModelCollectionCardConditionInput | null > | null,
  not?: ModelCollectionCardConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CollectionCard = {
  __typename: "CollectionCard",
  id: string,
  cardId: string,
  cardData: string,
  quantity: number,
  condition?: string | null,
  foil?: boolean | null,
  language?: string | null,
  collectionID: string,
  collection?: Collection | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateCollectionCardInput = {
  id: string,
  cardId?: string | null,
  cardData?: string | null,
  quantity?: number | null,
  condition?: string | null,
  foil?: boolean | null,
  language?: string | null,
  collectionID?: string | null,
};

export type DeleteCollectionCardInput = {
  id: string,
};

export type CreateDeckInput = {
  id?: string | null,
  name: string,
  format: string,
  colors: Array< string | null >,
  description?: string | null,
  isPublic?: boolean | null,
  tags?: Array< string | null > | null,
  createdAt?: string | null,
  lastModified?: string | null,
  userID: string,
};

export type ModelDeckConditionInput = {
  name?: ModelStringInput | null,
  format?: ModelStringInput | null,
  colors?: ModelStringInput | null,
  description?: ModelStringInput | null,
  isPublic?: ModelBooleanInput | null,
  tags?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  lastModified?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  and?: Array< ModelDeckConditionInput | null > | null,
  or?: Array< ModelDeckConditionInput | null > | null,
  not?: ModelDeckConditionInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Deck = {
  __typename: "Deck",
  id: string,
  name: string,
  format: string,
  colors: Array< string | null >,
  description?: string | null,
  isPublic?: boolean | null,
  tags?: Array< string | null > | null,
  createdAt?: string | null,
  lastModified?: string | null,
  userID: string,
  user?: User | null,
  updatedAt: string,
};

export type UpdateDeckInput = {
  id: string,
  name?: string | null,
  format?: string | null,
  colors?: Array< string | null > | null,
  description?: string | null,
  isPublic?: boolean | null,
  tags?: Array< string | null > | null,
  createdAt?: string | null,
  lastModified?: string | null,
  userID?: string | null,
};

export type DeleteDeckInput = {
  id: string,
};

export type CreateDeckCardInput = {
  id?: string | null,
  cardId: string,
  cardData: string,
  quantity: number,
  category: string,
  deckID: string,
};

export type ModelDeckCardConditionInput = {
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  category?: ModelStringInput | null,
  deckID?: ModelIDInput | null,
  and?: Array< ModelDeckCardConditionInput | null > | null,
  or?: Array< ModelDeckCardConditionInput | null > | null,
  not?: ModelDeckCardConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type DeckCard = {
  __typename: "DeckCard",
  id: string,
  cardId: string,
  cardData: string,
  quantity: number,
  category: string,
  deckID: string,
  deck?: Deck | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateDeckCardInput = {
  id: string,
  cardId?: string | null,
  cardData?: string | null,
  quantity?: number | null,
  category?: string | null,
  deckID?: string | null,
};

export type DeleteDeckCardInput = {
  id: string,
};

export type CreateFavoriteInput = {
  id?: string | null,
  cardId: string,
  cardData: string,
  addedAt?: string | null,
  userID: string,
};

export type ModelFavoriteConditionInput = {
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  addedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  and?: Array< ModelFavoriteConditionInput | null > | null,
  or?: Array< ModelFavoriteConditionInput | null > | null,
  not?: ModelFavoriteConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Favorite = {
  __typename: "Favorite",
  id: string,
  cardId: string,
  cardData: string,
  addedAt?: string | null,
  userID: string,
  user?: User | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateFavoriteInput = {
  id: string,
  cardId?: string | null,
  cardData?: string | null,
  addedAt?: string | null,
  userID?: string | null,
};

export type DeleteFavoriteInput = {
  id: string,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  avatar?: ModelStringInput | null,
  role?: ModelStringInput | null,
  joinedAt?: ModelStringInput | null,
  collectionsCount?: ModelIntInput | null,
  totalCards?: ModelIntInput | null,
  achievements?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelCollectionFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  isPublic?: ModelBooleanInput | null,
  backgroundImage?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  and?: Array< ModelCollectionFilterInput | null > | null,
  or?: Array< ModelCollectionFilterInput | null > | null,
  not?: ModelCollectionFilterInput | null,
};

export type ModelCollectionConnection = {
  __typename: "ModelCollectionConnection",
  items:  Array<Collection | null >,
  nextToken?: string | null,
};

export type ModelCollectionCardFilterInput = {
  id?: ModelIDInput | null,
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  condition?: ModelStringInput | null,
  foil?: ModelBooleanInput | null,
  language?: ModelStringInput | null,
  collectionID?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCollectionCardFilterInput | null > | null,
  or?: Array< ModelCollectionCardFilterInput | null > | null,
  not?: ModelCollectionCardFilterInput | null,
};

export type ModelCollectionCardConnection = {
  __typename: "ModelCollectionCardConnection",
  items:  Array<CollectionCard | null >,
  nextToken?: string | null,
};

export type ModelDeckFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  format?: ModelStringInput | null,
  colors?: ModelStringInput | null,
  description?: ModelStringInput | null,
  isPublic?: ModelBooleanInput | null,
  tags?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  lastModified?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDeckFilterInput | null > | null,
  or?: Array< ModelDeckFilterInput | null > | null,
  not?: ModelDeckFilterInput | null,
};

export type ModelDeckConnection = {
  __typename: "ModelDeckConnection",
  items:  Array<Deck | null >,
  nextToken?: string | null,
};

export type ModelDeckCardFilterInput = {
  id?: ModelIDInput | null,
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  quantity?: ModelIntInput | null,
  category?: ModelStringInput | null,
  deckID?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDeckCardFilterInput | null > | null,
  or?: Array< ModelDeckCardFilterInput | null > | null,
  not?: ModelDeckCardFilterInput | null,
};

export type ModelDeckCardConnection = {
  __typename: "ModelDeckCardConnection",
  items:  Array<DeckCard | null >,
  nextToken?: string | null,
};

export type ModelFavoriteFilterInput = {
  id?: ModelIDInput | null,
  cardId?: ModelStringInput | null,
  cardData?: ModelStringInput | null,
  addedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelFavoriteFilterInput | null > | null,
  or?: Array< ModelFavoriteFilterInput | null > | null,
  not?: ModelFavoriteFilterInput | null,
};

export type ModelFavoriteConnection = {
  __typename: "ModelFavoriteConnection",
  items:  Array<Favorite | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  avatar?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  joinedAt?: ModelSubscriptionStringInput | null,
  collectionsCount?: ModelSubscriptionIntInput | null,
  totalCards?: ModelSubscriptionIntInput | null,
  achievements?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionCollectionFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  isPublic?: ModelSubscriptionBooleanInput | null,
  backgroundImage?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userID?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionCollectionFilterInput | null > | null,
  or?: Array< ModelSubscriptionCollectionFilterInput | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionCollectionCardFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  cardId?: ModelSubscriptionStringInput | null,
  cardData?: ModelSubscriptionStringInput | null,
  quantity?: ModelSubscriptionIntInput | null,
  condition?: ModelSubscriptionStringInput | null,
  foil?: ModelSubscriptionBooleanInput | null,
  language?: ModelSubscriptionStringInput | null,
  collectionID?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCollectionCardFilterInput | null > | null,
  or?: Array< ModelSubscriptionCollectionCardFilterInput | null > | null,
};

export type ModelSubscriptionDeckFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  format?: ModelSubscriptionStringInput | null,
  colors?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  isPublic?: ModelSubscriptionBooleanInput | null,
  tags?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  lastModified?: ModelSubscriptionStringInput | null,
  userID?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDeckFilterInput | null > | null,
  or?: Array< ModelSubscriptionDeckFilterInput | null > | null,
};

export type ModelSubscriptionDeckCardFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  cardId?: ModelSubscriptionStringInput | null,
  cardData?: ModelSubscriptionStringInput | null,
  quantity?: ModelSubscriptionIntInput | null,
  category?: ModelSubscriptionStringInput | null,
  deckID?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDeckCardFilterInput | null > | null,
  or?: Array< ModelSubscriptionDeckCardFilterInput | null > | null,
};

export type ModelSubscriptionFavoriteFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  cardId?: ModelSubscriptionStringInput | null,
  cardData?: ModelSubscriptionStringInput | null,
  addedAt?: ModelSubscriptionStringInput | null,
  userID?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionFavoriteFilterInput | null > | null,
  or?: Array< ModelSubscriptionFavoriteFilterInput | null > | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserMutationVariables = {
  input: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateCollectionMutationVariables = {
  input: CreateCollectionInput,
  condition?: ModelCollectionConditionInput | null,
};

export type CreateCollectionMutation = {
  createCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type UpdateCollectionMutationVariables = {
  input: UpdateCollectionInput,
  condition?: ModelCollectionConditionInput | null,
};

export type UpdateCollectionMutation = {
  updateCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type DeleteCollectionMutationVariables = {
  input: DeleteCollectionInput,
  condition?: ModelCollectionConditionInput | null,
};

export type DeleteCollectionMutation = {
  deleteCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type CreateCollectionCardMutationVariables = {
  input: CreateCollectionCardInput,
  condition?: ModelCollectionCardConditionInput | null,
};

export type CreateCollectionCardMutation = {
  createCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCollectionCardMutationVariables = {
  input: UpdateCollectionCardInput,
  condition?: ModelCollectionCardConditionInput | null,
};

export type UpdateCollectionCardMutation = {
  updateCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCollectionCardMutationVariables = {
  input: DeleteCollectionCardInput,
  condition?: ModelCollectionCardConditionInput | null,
};

export type DeleteCollectionCardMutation = {
  deleteCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateDeckMutationVariables = {
  input: CreateDeckInput,
  condition?: ModelDeckConditionInput | null,
};

export type CreateDeckMutation = {
  createDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type UpdateDeckMutationVariables = {
  input: UpdateDeckInput,
  condition?: ModelDeckConditionInput | null,
};

export type UpdateDeckMutation = {
  updateDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type DeleteDeckMutationVariables = {
  input: DeleteDeckInput,
  condition?: ModelDeckConditionInput | null,
};

export type DeleteDeckMutation = {
  deleteDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type CreateDeckCardMutationVariables = {
  input: CreateDeckCardInput,
  condition?: ModelDeckCardConditionInput | null,
};

export type CreateDeckCardMutation = {
  createDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateDeckCardMutationVariables = {
  input: UpdateDeckCardInput,
  condition?: ModelDeckCardConditionInput | null,
};

export type UpdateDeckCardMutation = {
  updateDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteDeckCardMutationVariables = {
  input: DeleteDeckCardInput,
  condition?: ModelDeckCardConditionInput | null,
};

export type DeleteDeckCardMutation = {
  deleteDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateFavoriteMutationVariables = {
  input: CreateFavoriteInput,
  condition?: ModelFavoriteConditionInput | null,
};

export type CreateFavoriteMutation = {
  createFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateFavoriteMutationVariables = {
  input: UpdateFavoriteInput,
  condition?: ModelFavoriteConditionInput | null,
};

export type UpdateFavoriteMutation = {
  updateFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteFavoriteMutationVariables = {
  input: DeleteFavoriteInput,
  condition?: ModelFavoriteConditionInput | null,
};

export type DeleteFavoriteMutation = {
  deleteFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCollectionQueryVariables = {
  id: string,
};

export type GetCollectionQuery = {
  getCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type ListCollectionsQueryVariables = {
  filter?: ModelCollectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCollectionsQuery = {
  listCollections?:  {
    __typename: "ModelCollectionConnection",
    items:  Array< {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCollectionCardQueryVariables = {
  id: string,
};

export type GetCollectionCardQuery = {
  getCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCollectionCardsQueryVariables = {
  filter?: ModelCollectionCardFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCollectionCardsQuery = {
  listCollectionCards?:  {
    __typename: "ModelCollectionCardConnection",
    items:  Array< {
      __typename: "CollectionCard",
      id: string,
      cardId: string,
      cardData: string,
      quantity: number,
      condition?: string | null,
      foil?: boolean | null,
      language?: string | null,
      collectionID: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDeckQueryVariables = {
  id: string,
};

export type GetDeckQuery = {
  getDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type ListDecksQueryVariables = {
  filter?: ModelDeckFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDecksQuery = {
  listDecks?:  {
    __typename: "ModelDeckConnection",
    items:  Array< {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDeckCardQueryVariables = {
  id: string,
};

export type GetDeckCardQuery = {
  getDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListDeckCardsQueryVariables = {
  filter?: ModelDeckCardFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDeckCardsQuery = {
  listDeckCards?:  {
    __typename: "ModelDeckCardConnection",
    items:  Array< {
      __typename: "DeckCard",
      id: string,
      cardId: string,
      cardData: string,
      quantity: number,
      category: string,
      deckID: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetFavoriteQueryVariables = {
  id: string,
};

export type GetFavoriteQuery = {
  getFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListFavoritesQueryVariables = {
  filter?: ModelFavoriteFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFavoritesQuery = {
  listFavorites?:  {
    __typename: "ModelFavoriteConnection",
    items:  Array< {
      __typename: "Favorite",
      id: string,
      cardId: string,
      cardData: string,
      addedAt?: string | null,
      userID: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    avatar?: string | null,
    role?: string | null,
    joinedAt?: string | null,
    collectionsCount?: number | null,
    totalCards?: number | null,
    achievements?: Array< string | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionFilterInput | null,
};

export type OnCreateCollectionSubscription = {
  onCreateCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type OnUpdateCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionFilterInput | null,
};

export type OnUpdateCollectionSubscription = {
  onUpdateCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type OnDeleteCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionFilterInput | null,
};

export type OnDeleteCollectionSubscription = {
  onDeleteCollection?:  {
    __typename: "Collection",
    id: string,
    name: string,
    description?: string | null,
    isPublic?: boolean | null,
    backgroundImage?: string | null,
    createdAt?: string | null,
    updatedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type OnCreateCollectionCardSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionCardFilterInput | null,
};

export type OnCreateCollectionCardSubscription = {
  onCreateCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCollectionCardSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionCardFilterInput | null,
};

export type OnUpdateCollectionCardSubscription = {
  onUpdateCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCollectionCardSubscriptionVariables = {
  filter?: ModelSubscriptionCollectionCardFilterInput | null,
};

export type OnDeleteCollectionCardSubscription = {
  onDeleteCollectionCard?:  {
    __typename: "CollectionCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    condition?: string | null,
    foil?: boolean | null,
    language?: string | null,
    collectionID: string,
    collection?:  {
      __typename: "Collection",
      id: string,
      name: string,
      description?: string | null,
      isPublic?: boolean | null,
      backgroundImage?: string | null,
      createdAt?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateDeckSubscriptionVariables = {
  filter?: ModelSubscriptionDeckFilterInput | null,
};

export type OnCreateDeckSubscription = {
  onCreateDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateDeckSubscriptionVariables = {
  filter?: ModelSubscriptionDeckFilterInput | null,
};

export type OnUpdateDeckSubscription = {
  onUpdateDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteDeckSubscriptionVariables = {
  filter?: ModelSubscriptionDeckFilterInput | null,
};

export type OnDeleteDeckSubscription = {
  onDeleteDeck?:  {
    __typename: "Deck",
    id: string,
    name: string,
    format: string,
    colors: Array< string | null >,
    description?: string | null,
    isPublic?: boolean | null,
    tags?: Array< string | null > | null,
    createdAt?: string | null,
    lastModified?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    updatedAt: string,
  } | null,
};

export type OnCreateDeckCardSubscriptionVariables = {
  filter?: ModelSubscriptionDeckCardFilterInput | null,
};

export type OnCreateDeckCardSubscription = {
  onCreateDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateDeckCardSubscriptionVariables = {
  filter?: ModelSubscriptionDeckCardFilterInput | null,
};

export type OnUpdateDeckCardSubscription = {
  onUpdateDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteDeckCardSubscriptionVariables = {
  filter?: ModelSubscriptionDeckCardFilterInput | null,
};

export type OnDeleteDeckCardSubscription = {
  onDeleteDeckCard?:  {
    __typename: "DeckCard",
    id: string,
    cardId: string,
    cardData: string,
    quantity: number,
    category: string,
    deckID: string,
    deck?:  {
      __typename: "Deck",
      id: string,
      name: string,
      format: string,
      colors: Array< string | null >,
      description?: string | null,
      isPublic?: boolean | null,
      tags?: Array< string | null > | null,
      createdAt?: string | null,
      lastModified?: string | null,
      userID: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateFavoriteSubscriptionVariables = {
  filter?: ModelSubscriptionFavoriteFilterInput | null,
};

export type OnCreateFavoriteSubscription = {
  onCreateFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFavoriteSubscriptionVariables = {
  filter?: ModelSubscriptionFavoriteFilterInput | null,
};

export type OnUpdateFavoriteSubscription = {
  onUpdateFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFavoriteSubscriptionVariables = {
  filter?: ModelSubscriptionFavoriteFilterInput | null,
};

export type OnDeleteFavoriteSubscription = {
  onDeleteFavorite?:  {
    __typename: "Favorite",
    id: string,
    cardId: string,
    cardData: string,
    addedAt?: string | null,
    userID: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      avatar?: string | null,
      role?: string | null,
      joinedAt?: string | null,
      collectionsCount?: number | null,
      totalCards?: number | null,
      achievements?: Array< string | null > | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
