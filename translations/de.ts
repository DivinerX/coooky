export default {
  common: {
    greeting: "Hallo!",
    whatToCook: "Was möchten Sie heute kochen?",
    singleRecipe: "Einzelnes Rezept",
    weeklyPlanning: "Wochenplan",
    surpriseMe: "Überrasche mich",
    deleteItemConfirmationTitle: "Element löschen",
    deleteItemConfirmationMessage: "Sind Sie sicher, dass Sie dieses Element löschen möchten?",
    deleteAllConfirmationMessage: "Sind Sie sicher, dass Sie alles löschen möchten?",
    deleteAllConfirmationTitle: "Alle Elemente löschen",
    cancel: "Abbrechen",
    delete: "Löschen",
    move: "Verschieben",
    ok: "OK",
    success: "Erfolg",
    error: "Fehler",
    week: "Woche",
    minutes: "minuten",
    custom: "Benutzerdefiniert",
    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag",
    }
  },
  tabs: {
    discover: "Entdecken",
    cook: "Kochen",
    planner: "Planer",
    shopping: "Einkaufen",
    settings: "Einstellungen",
  },
  plan: {
    addRecipe: "Rezept hinzufügen",
    generateSuggestions: "Vorschläge generieren",
    shoppingList: "Einkaufsliste",
    addWeek: "Wochenplan hinzufügen",
    weekPlan: "Wochenplan",
    selectWeek: "Wochenplan auswählen",
    nextWeek: "Nächste Woche",
    twoWeeks: "In 2 Wochen",
    threeWeeks: "In 3 Wochen",
    fourWeeks: "In 4 Wochen",
    existingWeeks: "Vorhandene Wochen",
    moveRecipe: "Rezept verschieben",
    selectTargetDay: "Zieltag auswählen:",
    day: "Tag",
    editRecipe: "Rezept bearbeiten",
    editRecipeWarning: "Dies wird das Rezept auf den ausgewählten Tag verschieben und es aus dem aktuellen Tag entfernen. Dies kann Ihre Einkaufsliste beeinflussen.",
    cookRecipe: "Rezept kochen",
    cookNow: "Jetzt kochen",
    noWeekPlans: "Keine Wochenpläne gefunden. Erstellen Sie einen neuen Wochenplan oder planen Sie Ihre Woche.",
  },
  cook: {
    portions: "Portionen",
    selectRecipe: "Rezept auswählen",
    pleaseSelectRecipe: "Bitte wählen Sie ein Rezept",
    weekPlan: "Wochenplan",
    allRecipes: "Alle Rezepte",
    ingredients: "Zutaten",
    stepByStepInstructions: "Schritt für Schritt Anleitung",
    step: "Schritt",
    of: "von",
    changeRecipe: "Rezept ändern",
    recipes: "Rezepte",
  },
  chat: {
    cookingAssistant: "Kochen Assistent",
    weeklyPlanning: "Wochenplan",
    initialMessage: "Bevor wir beginnen, haben Sie irgendwelche besonderen Ernährungsanforderungen oder Allergien, die ich berücksichtigen sollte?",
    writeMessage: "Schreiben Sie eine Nachricht...",
    analyzingPreferences: "Prüfen von Präferenzen",
    recipeRequestMessage: "Was wollen wir kochen? Was magst du?",
    surpriseMe: "Überrasche mich",
    servingsMessage: "Wie viele Portionen möchten Sie pro Rezept?",
    recipeCountMessage: "Wie viele Rezepte möchten Sie generieren?",
    servingMessage: "Ich plane mit {{servings}} Portionen pro Rezept und erstelle {{recipeCount}} passende Rezepte für Sie...",
    progress: {
      startRecipeSearch: "Rezeptsuche starten...",
      searchCookbooks: "Kochbücher durchsuchen...",
      analyzeIngredients: "Zutaten analysieren...",
      createRecipeDrafts: "Rezeptentwürfe erstellen...",
      optimizeIngredientList: "Zutatenliste optimieren...",
      refineSpices: "Gewürze verfeinern...",
      calculateQuantities: "Mengen berechnen...",
      checkCombinations: "Kombinationen prüfen...",
      finalizeRecipes: "Rezepte abschließen...",
      prepareSuggestions: "Vorschläge vorbereiten...",
    },
    soupBurnt: "Oops! Die Suppe ist verbrannt...",
    errorGeneratingRecipes: "Es gab einen Fehler beim Generieren der Rezepte: {{error.message || 'Unbekannter Fehler'}}. Bitte versuchen Sie es später erneut.",
    errorProcessingPreferences: "Es gab einen Fehler beim Verarbeiten Ihrer Präferenzen. Bitte versuchen Sie es später erneut.",
    surpriseMeMessage: "Ich werde Ihnen mit {{cuisine}} {{icon}} Rezepte überraschen! Wie viele Rezepte soll ich vorschlagen?",
    portions: "Portionen",
    generatedRecipes: "Generierte Rezepte",
    generatedRecipesResult: "Hier sind {{count}} Rezepte basierend auf Ihren Präferenzen:\n\n",
    addToShoppingList: "Zur Einkaufsliste hinzufügen",
    addToWeekPlan: "Zum Wochenplan hinzufügen",
    shoppingList: "Einkaufsliste",
    shoppingListUpdated: "Einkaufsliste aktualisiert",
    errorAddingToShoppingList: "Fehler beim Hinzufügen zur Einkaufsliste",
    recipesAddedToWeekPlan: "Rezepte hinzugefügt zum Wochenplan",
    recipesNotAddedToWeekPlan: "Rezepte nicht hinzugefügt zum Wochenplan",
    preferencesSaved: "Präferenzen gespeichert",
    attentionAllergies: "Ich werde besonderer Beachtung bei diesen Allergien schenken",
    customServingsPrompt: "Bitte geben Sie die Anzahl der Portionen ein (1-20):",
    invalidServings: "Bitte geben Sie eine gültige Zahl zwischen 1 und 20 ein.",
  },
  categories: {
    asian: "Asiatisch",
    italian: "Italienisch",
    mediterranean: "Mediterran",
    german: "Deutsch",
    mexican: "Mexikanisch",
    vegetarian: "Vegetarisch",
    quick: "Schnell",
    fruitVegetables: "Obst & Gemüse",
    dairyProducts: "Milchprodukte",
    meatFish: "Fleisch & Fisch",
    grainProducts: "Getreideprodukte",
    spices: "Gewürze",
    oilsVinegar: "Öle & Essig",
    legumes: "Hülsenfrüchte",
    other: "Sonstiges",
  },
  shopping:{
    title: "Einkaufsliste",
    addWeek: "Wochenplan hinzufügen",
    selectWeek: "Wochenplan auswählen",
    addNewWeek: "Neue Woche hinzufügen",
    nextWeek: "Nächste Woche",
    twoWeeks: "In 2 Wochen",
    threeWeeks: "In 3 Wochen",
    fourWeeks: "In 4 Wochen",
    existingWeeks: "Vorhandene Wochen",
    hideCompleted: "Abgeschlossene ausblenden",
    showCompleted: "Abgeschlossene anzeigen",
    share: "Teilen",
    addItemPlaceholder: "Artikel hinzufügen...",
    deleteAll: "Alle löschen",
    noLists: "Keine Einkaufslisten gefunden. Erstellen Sie eine neue Einkaufsliste oder fügen Sie Artikel zu Ihrer Einkaufsliste hinzu.",
    ingredientsNotAdded: "Zutaten nicht zur Einkaufsliste hinzugefügt",
    selectCategory: "Kategorie auswählen",
  },
  settings: {
    title: "Einstellungen",
    edit: "Bearbeiten",
    notifications: "Benachrichtigungen",
    general: "Allgemein",
    appSettings: "App Einstellungen",
    darkMode: "Dunkler Modus",
    voiceGuide: "Sprachführung",
    language: "Sprache",
    nutritionalPreferences: "Ernährungspräferenzen",
    helpSupport: "Hilfe & Support",
    faq: "FAQ",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    logout: "Abmelden",
    version: "Version 1.0.0",
    selectLanguage: "Sprache auswählen",
    habits: "Lebensmittelgewohnheiten",
    favorites: "Lieblingsessen",
    allergies: "Allergien",
    trends: "Bevorzugte Küchen",
    habitsPlaceholder: "z.B. vegetarisch, vegan...",
    favoritesPlaceholder: "z.B. Pasta, Reis...",
    allergiesPlaceholder: "z.B. Nüsse, Gluten...",
    trendsPlaceholder: "z.B. Asiatisch, Italienisch...",
  },
  subscription: {
    title: "Premium Features",
    description: "Get unlimited recipe generations and unlock all premium features",
    monthly: "Monthly Subscription",
    annual: "Annual Subscription",
  }
};