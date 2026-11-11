import { buildInterestMailto, interestPrefill, matchingLanguages, normalizeLanguage, searchableLanguage, MAX_LANGUAGE_CHOICES, type InterestDraft, type InterestRole, type MailtoConfiguration } from "./interest-rules";
import { advanceInterestJourney, optionalBackingLink, type InterestJourney, type InterestJourneyEvent } from "./interest-journey";

/** Required controls are local to one form so both modes can safely coexist. */
function control<ElementType extends Element>(form: HTMLFormElement, selector: string): ElementType {
  const element = form.querySelector<ElementType>(selector);
  if (!element) throw new Error(`Missing interest form control: ${selector}`);
  return element;
}

/** Attach progressive-enhancement behavior once to each interest form. */
export function initializeInterestForms(): void {
  document.querySelectorAll<HTMLFormElement>("[data-gloss-interest]").forEach(form => {
    if (form.dataset['initialized']) return;
    form.dataset['initialized'] = 'true';
    initializeInterestForm(form);
  });
}

function initializeInterestForm(form: HTMLFormElement): void {
  const configuration = JSON.parse(form.dataset['configuration'] ?? '{}') as MailtoConfiguration;
  const prefill = interestPrefill(location.search, configuration.rewards.map(reward => reward.id));
  const selectedLanguages = new Set(prefill.languages);
  const rewardSelect = form.querySelector<HTMLSelectElement>('[data-reward-select]');
  if (rewardSelect) rewardSelect.value = prefill.rewardId;
  if (prefill.rewardId && rewardSelect) {
    control<HTMLElement>(form, '[data-reward-field]').hidden = false;
    control<HTMLSelectElement>(form, '[data-interest-role]').value = 'backer';
  }
  const updateDraft = () => renderDraft(form, configuration, selectedLanguages, rewardSelect?.value ?? '');
  const updateLanguages = () => { renderLanguages(form, selectedLanguages); updateDraft(); };
  attachLanguageControls(form, selectedLanguages, updateLanguages);
  form.addEventListener('input', updateDraft);
  form.addEventListener('change', updateDraft);
  form.addEventListener('submit', event => event.preventDefault());
  attachRewardControls(form, configuration, rewardSelect, updateDraft);
  if (form.dataset['mode'] === 'reader') attachInterestJourney(form);
  updateLanguages();
}

function renderDraft(form: HTMLFormElement, configuration: MailtoConfiguration, selectedLanguages: Set<string>, rewardId: string): void {
  const draft: InterestDraft = {
    languages: [...selectedLanguages], rewardId,
    role: control<HTMLSelectElement>(form, '[data-interest-role]').value as InterestRole,
    message: control<HTMLTextAreaElement>(form, '[data-interest-message]').value,
  };
  const href = buildInterestMailto(draft, configuration);
  control<HTMLAnchorElement>(form, '[data-email-draft]').href = href;
  control<HTMLTextAreaElement>(form, '[data-draft-preview]').value = new URL(href).searchParams.get('body') ?? '';
  const backingLink = form.querySelector<HTMLAnchorElement>('[data-optional-backing-link]');
  if (backingLink) backingLink.href = optionalBackingLink([...selectedLanguages], backingLink.href);
}

function attachInterestJourney(form: HTMLFormElement): void {
  let state: InterestJourney = 'editing';
  const confirmation = control<HTMLElement>(form, '[data-interest-confirmation]');
  const backing = control<HTMLElement>(form, '[data-optional-backing]');
  const advance = (event: InterestJourneyEvent) => {
    state = advanceInterestJourney(state, event);
    confirmation.hidden = state !== 'handoff';
    backing.hidden = state !== 'self-confirmed';
  };
  control<HTMLAnchorElement>(form, '[data-email-draft]').addEventListener('click', () => advance('draft-opened'));
  const fallback = control<HTMLDetailsElement>(form, '[data-interest-fallback]');
  fallback.addEventListener('toggle', () => { if (fallback.open) advance('fallback-opened'); });
  control<HTMLButtonElement>(form, '[data-confirm-interest]').addEventListener('click', () => {
    advance('confirm-sent');
    if (state === 'self-confirmed') control<HTMLElement>(form, '[data-optional-heading]').focus();
  });
}

function attachRewardControls(form: HTMLFormElement, configuration: MailtoConfiguration, select: HTMLSelectElement | null, update: () => void): void {
  if (select) document.querySelectorAll<HTMLAnchorElement>('[data-reward-id]').forEach(link => {
    link.addEventListener('click', () => {
      const rewardId = link.dataset['rewardId'] ?? '';
      if (!configuration.rewards.some(reward => reward.id === rewardId)) return;
      select.value = rewardId;
      update();
    });
  });
  control<HTMLAnchorElement>(form, '[data-email-draft]').addEventListener('click', () => {
    control<HTMLElement>(form, '[data-handoff-status]').textContent = 'Your email app should open. Review and send the draft there; nothing has been submitted or reserved on this page.';
  });
}

function attachLanguageControls(form: HTMLFormElement, selected: Set<string>, update: () => void): void {
  const search = control<HTMLInputElement>(form, '[data-language-search]');
  const addButton = control<HTMLButtonElement>(form, '[data-add-language]');
  search.addEventListener('input', () => filterLanguages(form, search.value, selected));
  addButton.addEventListener('click', () => addCustomLanguage(form, selected, update));
  search.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); addCustomLanguage(form, selected, update); }
  });
  form.querySelectorAll<HTMLInputElement>('[data-language-choice]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked && selected.size < MAX_LANGUAGE_CHOICES) selected.add(input.value);
      else if (!input.checked) selected.delete(input.value);
      update();
    });
  });
}

function addCustomLanguage(form: HTMLFormElement, selected: Set<string>, update: () => void): void {
  const search = control<HTMLInputElement>(form, '[data-language-search]');
  const language = normalizeLanguage(search.value);
  if (!language || selected.size >= MAX_LANGUAGE_CHOICES) return;
  const duplicate = [...selected].some(value => searchableLanguage(value) === searchableLanguage(language));
  const canonical = matchingLanguages(language).find(value => searchableLanguage(value) === searchableLanguage(language));
  if (!duplicate) selected.add(canonical ?? language);
  search.value = '';
  update();
  search.focus();
}

function filterLanguages(form: HTMLFormElement, query: string, selected: Set<string>): void {
  const matching = new Set(matchingLanguages(query));
  form.querySelectorAll<HTMLElement>('[data-language-option]').forEach(label => {
    const input = label.querySelector<HTMLInputElement>('input');
    label.hidden = !input || !matching.has(input.value);
  });
  const custom = normalizeLanguage(query);
  const addButton = control<HTMLButtonElement>(form, '[data-add-language]');
  addButton.hidden = !custom || [...selected].some(value => searchableLanguage(value) === searchableLanguage(custom));
  addButton.disabled = selected.size >= MAX_LANGUAGE_CHOICES;
  addButton.textContent = `Add “${custom}”`;
  control<HTMLElement>(form, '[data-no-languages]').hidden = matching.size > 0;
}

function renderLanguages(form: HTMLFormElement, selected: Set<string>): void {
  form.querySelectorAll<HTMLInputElement>('[data-language-choice]').forEach(input => {
    input.checked = [...selected].some(value => searchableLanguage(value) === searchableLanguage(input.value));
    input.disabled = selected.size >= MAX_LANGUAGE_CHOICES && !input.checked;
  });
  renderSelectedChips(form, selected);
  control<HTMLElement>(form, '[data-language-status]').textContent = selected.size ? `${selected.size} of ${MAX_LANGUAGE_CHOICES} language preferences selected${selected.size === MAX_LANGUAGE_CHOICES ? '. Remove one to add another.' : '.'}` : 'No preference yet. You can leave this open.';
  filterLanguages(form, control<HTMLInputElement>(form, '[data-language-search]').value, selected);
}

function renderSelectedChips(form: HTMLFormElement, selected: Set<string>): void {
  const container = control<HTMLElement>(form, '[data-selected-languages]');
  container.replaceChildren(...[...selected].map(language => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${language} ×`;
    button.setAttribute('aria-label', `Remove ${language}`);
    button.addEventListener('click', () => {
      selected.delete(language);
      renderLanguages(form, selected);
      form.dispatchEvent(new Event('change'));
      control<HTMLInputElement>(form, '[data-language-search]').focus();
    });
    return button;
  }));
}
