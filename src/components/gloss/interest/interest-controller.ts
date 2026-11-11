import { interestPrefill, matchingLanguages, normalizeLanguage, searchableLanguage, MAX_LANGUAGE_CHOICES } from "./interest-rules";
import { registerInterest, updatePreferences, readReceipt, rememberReceipt, newReceipt, type InterestReceipt } from "./interest-api";

/** Find a required control within its own form. */
function control<ElementType extends Element>(form: HTMLFormElement, selector: string): ElementType {
  const element = form.querySelector<ElementType>(selector);
  if (!element) throw new Error(`Missing interest form control: ${selector}`);
  return element;
}
/** Initialize each email-first form once. */
export function initializeInterestForms(): void {
  document.querySelectorAll<HTMLFormElement>("[data-gloss-interest]").forEach(form => {
    if (form.dataset['initialized']) return;
    form.dataset['initialized'] = 'true';
    initializeInterestForm(form);
  });
}
function showSaved(form: HTMLFormElement): void {
  control<HTMLElement>(form,'[data-signup-fields]').hidden = true;
  control<HTMLInputElement>(form,'[data-interest-email]').required = false;
  control<HTMLElement>(form,'[data-optional-backing]').hidden = false;
  control<HTMLElement>(form,'[data-preferences]').hidden = false;
}
function initializeInterestForm(form: HTMLFormElement): void {
  const configuration = JSON.parse(form.dataset['configuration'] ?? '{}') as {endpoint:string; rewards:{id:string}[]};
  const prefill = interestPrefill(location.search, configuration.rewards.map(reward => reward.id));
  let receipt: InterestReceipt = readReceipt() ?? newReceipt();
  const selectedLanguages = new Set(prefill.languages.length ? prefill.languages : receipt.languages);
  const reward = control<HTMLSelectElement>(form,'[data-reward-select]');
  reward.value = prefill.rewardId || receipt.rewardId;
  attachLanguageControls(form, selectedLanguages, () => renderLanguages(form,selectedLanguages));
  renderLanguages(form,selectedLanguages);
  if (receipt.saved) showSaved(form);
  document.querySelectorAll<HTMLAnchorElement>('[data-reward-id]').forEach(link => link.addEventListener('click',()=>{
    const rewardId=link.dataset['rewardId'] ?? '';
    if(configuration.rewards.some(item=>item.id===rewardId)) reward.value=rewardId;
  }));
  let submitting=false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(submitting || !form.reportValidity()) return;
    submitting=true;
    const wasSaved=receipt.saved;
    const status=control<HTMLElement>(form, wasSaved ? '[data-preference-status]' : '[data-save-status]');
    const buttons=form.querySelectorAll<HTMLButtonElement>('button[type="submit"]');
    buttons.forEach(button=>button.disabled=true);
    status.textContent='Saving…';
    try {
      if(wasSaved) {
        await updatePreferences(configuration.endpoint,receipt.token,[...selectedLanguages],reward.value);
        receipt={...receipt,languages:[...selectedLanguages],rewardId:reward.value};
        status.textContent='Your preferences are saved. No payment or reservation has been made.';
      } else {
        await registerInterest(configuration.endpoint,control<HTMLInputElement>(form,'[data-interest-email]').value,receipt.token);
        receipt={...receipt,saved:true};
        status.textContent='Your interest has been saved.';
        showSaved(form);
        control<HTMLElement>(form,'[data-optional-heading]').focus();
      }
      rememberReceipt(receipt);
    } catch(error) {
      status.textContent=error instanceof Error ? error.message : 'We couldn’t save this. Please try again.';
    } finally { submitting=false;buttons.forEach(button=>button.disabled=false); }
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
