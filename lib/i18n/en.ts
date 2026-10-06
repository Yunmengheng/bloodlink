/**
 * English dictionary. This is the source of truth for the key set: km.ts is
 * typed as Dictionary, so a missing or misspelled Khmer key fails type-check.
 */
export const en = {
  common: {
    appName: "BloodLink KH",
    tagline: "Every drop finds its match",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    back: "Back",
    loading: "Loading…",
    optional: "optional",
    required: "required",
    viewDetails: "View details",
    somethingWentWrong: "Something went wrong. Please try again.",
    disclaimer:
      "BloodLink KH only connects people. Hospitals perform screening and cross-matching before any transfusion.",
  },

  nav: {
    home: "Home",
    forYou: "For you",
    post: "Post",
    profile: "Profile",
    myRequests: "My requests",
    learn: "Learn",
    language: "Language",
  },

  home: {
    heroBadge: "Cambodia · Phnom Penh",
    heroLead:
      "When a family needs blood, a Facebook post reaches everyone and helps almost no one. BloodLink KH sends the request only to donors who can actually give — and keeps phone numbers private.",
    iNeedBlood: "I need blood",
    iWantToDonate: "I want to donate",
    noPublicNumbers: "Free. No public phone numbers, ever.",
    statsOpen: "Open requests",
    statsDonors: "Registered donors",
    statsFulfilled: "Requests fulfilled",
    neededNow: "Blood types needed now",
    neededNowEmpty: "No open requests right now.",
    openRequests: "Open requests",
    howItWorks: "How it works",
    step1Title: "Post what is needed",
    step1Body:
      "Blood type, hospital, district and how urgent it is. Your phone number stays off the public page.",
    step2Title: "Reach the right donors",
    step2Body:
      "Only donors whose blood type is compatible, and who are eligible to donate today, see your request.",
    step3Title: "Share contact privately",
    step3Body:
      "A donor who offers to help unlocks your contact details. Nobody else ever sees them.",
  },

  feed: {
    filterBloodType: "Blood type",
    filterDistrict: "District",
    allBloodTypes: "All blood types",
    allDistricts: "All districts",
    clearFilters: "Clear filters",
    emptyTitle: "No open requests match these filters.",
    emptyBody: "Try clearing the filters, or check back a little later.",
    resultCount: "{count} open request(s)",
  },

  request: {
    unitsNeeded: "Units needed",
    unitsProgress: "{responded} of {needed} donors responded",
    hospital: "Hospital",
    district: "District",
    neededBy: "Needed by",
    posted: "Posted",
    note: "Note",
    patientBloodType: "Patient blood type",
    status: "Status",
    statusOpen: "Open",
    statusFulfilled: "Fulfilled",
    statusCancelled: "Cancelled",
    urgencyCritical: "Critical",
    urgencyUrgent: "Urgent",
    urgencyStandard: "Standard",
    responders: "Donors who offered to help",
    noResponders: "No donors have responded yet.",
    noRespondersBody:
      "Compatible donors are being shown this request. We will list them here as they offer.",
    contactName: "Contact name",
    call: "Call",
    telegram: "Telegram",
    markFulfilled: "Mark fulfilled",
    cancelRequest: "Cancel request",
    confirmFulfilled: "Mark this request as fulfilled?",
    confirmCancel: "Cancel this request? Donors will no longer see it.",
    requesterContact: "Requester contact",
    contactUnlocked:
      "You offered to help, so you can now contact the requester directly.",
  },

  help: {
    iCanHelp: "I can help",
    sending: "Sending…",
    withdraw: "Withdraw offer",
    messageLabel: "Message to the family",
    messagePlaceholder: "When you can come, or anything helpful.",
    alreadyResponded: "You have offered to help with this request.",
    signInToHelp: "Sign in to help",
    signInToHelpBody: "Sign in to see contact details and offer to donate.",
    needProfile: "Create your donor profile first",
    needProfileBody:
      "We need your blood type to check whether you can help with this request.",
    reasonIncompatible:
      "Your blood type ({donor}) cannot be given to a patient with {recipient}.",
    reasonNotEligible: "You can donate again on {date}.",
    reasonUnavailable:
      "You have paused your availability. Turn it back on in your profile.",
    reasonClosed: "This request is no longer open.",
    thanks: "Thank you. The family can now see your contact details.",
    withdrawn: "Your offer has been withdrawn.",
  },

  donor: {
    title: "Donor profile",
    subtitle: "We only share your contact with families you offer to help.",
    fullName: "Full name",
    bloodType: "Your blood type",
    district: "Your district",
    phone: "Phone number",
    telegram: "Telegram username",
    telegramHint: "Without the @",
    contactHint: "Give at least one: a phone number or a Telegram username.",
    lastDonation: "Last donation date",
    lastDonationHint: "Leave empty if you have never donated.",
    available: "Available to donate",
    availableHint: "Turn this off to stop seeing matched requests for a while.",
    createProfile: "Create donor profile",
    saveProfile: "Save profile",
    saved: "Profile saved.",
    eligibleNow: "You can donate today",
    eligibleNowBody: "Thank you for being ready to help.",
    notEligible: "You can donate again on {date}",
    daysRemaining: "{days} day(s) to go",
    eligibilityNote:
      "This is a guide based on a {days}-day interval. The blood centre makes the final decision when you arrive.",
  },

  forYou: {
    title: "For you",
    subtitle: "Open requests you can help with right now.",
    emptyTitle: "No matching requests right now.",
    emptyBody:
      "We will show requests here as soon as a compatible patient needs your blood type.",
    notEligibleTitle: "You are not eligible to donate yet",
    noProfileTitle: "Create your donor profile",
    noProfileBody:
      "Tell us your blood type and district, and we will show you only the requests you can actually help with.",
  },

  myRequests: {
    title: "My requests",
    subtitle: "Requests you have posted.",
    emptyTitle: "You have not posted a request yet.",
    emptyBody: "When someone needs blood, post a request and we will find donors.",
    postRequest: "Post a request",
    responseCount: "{count} response(s)",
  },

  newRequest: {
    title: "Post a blood request",
    subtitle: "This takes about a minute. Your contact stays private.",
    sectionPatient: "Who needs blood",
    sectionWhere: "Where to donate",
    sectionContact: "How donors reach you",
    contactPrivacy:
      "Only donors who offer to help will see this. It is never shown publicly.",
    units: "Units needed",
    urgency: "How urgent?",
    urgencyCriticalHint: "Needed within hours",
    urgencyUrgentHint: "Needed within a day or two",
    urgencyStandardHint: "Planned or scheduled",
    neededBy: "Needed by",
    note: "Anything else donors should know?",
    notePlaceholder: "Ward, visiting hours, or who to ask for.",
    submit: "Post request",
    submitting: "Posting…",
    posted: "Your request is live. Compatible donors can now see it.",
  },

  learn: {
    title: "About donating blood",
    whyTitle: "Why it matters",
    whyBody:
      "Blood cannot be manufactured. Every unit a patient receives came from a person who chose to give. In Cambodia, most hospital blood comes from family and friends of the patient, which means a family in an emergency often has to find donors themselves, quickly.",
    whoTitle: "Who can usually donate",
    whoBody:
      "Rules vary, and only the blood centre can confirm whether you are eligible on the day. Generally, donors are healthy adults of a minimum weight, who are not currently ill, pregnant or recently treated for certain conditions.",
    intervalTitle: "How often",
    intervalBody:
      "BloodLink KH uses a {days}-day interval between whole-blood donations as a guide. Confirm the real interval with the blood centre — it can differ by donor.",
    centerTitle: "National Blood Transfusion Center",
    centerBody:
      "The NBTC in Phnom Penh collects, screens and supplies blood across Cambodia.",
    centerLink: "Visit the National Blood Transfusion Center",
    safetyTitle: "Safety",
    privacyTitle: "Your privacy on BloodLink KH",
    privacyBody:
      "Your phone number and Telegram username are never shown on a public page. A requester sees your contact only after you choose to offer help on their request. You can withdraw an offer at any time.",
  },

  auth: {
    signInTitle: "Welcome back",
    signInSubtitle: "Sign in to post a request or offer to donate.",
    signUpTitle: "Create your account",
    signUpSubtitle: "It takes a moment, and it is free.",
    email: "Email",
    password: "Password",
    repeatPassword: "Repeat password",
    forgotPassword: "Forgot your password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    forgotTitle: "Reset your password",
    forgotSubtitle: "We will email you a link to set a new password.",
    sendResetEmail: "Send reset link",
    sending: "Sending…",
    checkEmailTitle: "Check your email",
    checkEmailBody:
      "If an account exists for that address, a password reset link is on its way.",
    signUpSuccessTitle: "Confirm your email",
    signUpSuccessBody:
      "We sent you a confirmation link. Open it to activate your account, then sign in.",
    newPassword: "New password",
    saveNewPassword: "Save new password",
    errorTitle: "Sorry, something went wrong",
  },

  errors: {
    notSignedIn: "Please sign in first.",
    notAllowed: "You are not allowed to do that.",
    notFound: "We could not find that.",
    requestClosed: "This request is no longer open.",
    alreadyResponded: "You have already offered to help with this request.",
    noDonorProfile: "Create your donor profile first.",
    incompatible: "Your blood type is not compatible with this request.",
    notEligibleYet: "You are not eligible to donate yet.",
    unavailable: "Your profile is set to unavailable.",
    contactRequired: "Give at least one: a phone number or a Telegram username.",
    invalidBloodType: "Choose a blood type.",
    invalidDistrict: "Choose a district.",
    nameRequired: "Please enter a name.",
    hospitalRequired: "Please enter the hospital.",
    unitsRange: "Units must be between 1 and 10.",
    noteTooLong: "Note is too long (max 300 characters).",
    messageTooLong: "Message is too long (max 200 characters).",
    dateInFuture: "That date cannot be in the future.",
    dateInPast: "That date cannot be in the past.",
    phoneInvalid: "Enter a valid phone number.",
    telegramInvalid: "Use letters, numbers and underscores only.",
  },
} as const;

/** The shape every dictionary must satisfy. */
export type Dictionary = {
  [S in keyof typeof en]: { [K in keyof (typeof en)[S]]: string };
};
