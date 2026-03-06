<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="handleDialogUpdate"
  >
    <div class="edit-dialog">
      <!-- Header -->
      <div class="edit-header">
        <div class="edit-header__top">
          <button class="edit-header__back" @click="handleBack">
            <span class="material-icons-outlined">arrow_back</span>
          </button>
          <div class="type-icon" :class="form.type">
            <span class="material-icons-outlined">{{ typeIcon(form.type) }}</span>
          </div>
          <div class="edit-header__info">
            <div class="edit-header__species">
              {{ form.species || t('admin.newPlant') }}
            </div>
            <div v-if="form.variety" class="edit-header__variety">
              '{{ form.variety }}'
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

      <!-- Tab bar -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ 'tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab__icon">
            <span class="material-icons-outlined">{{ tab.icon }}</span>
          </span>
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="tab__badge"
            :class="tabBadgeClass(tab.id)"
          >
            {{ tabBadgeText(tab.id) }}
          </span>
        </button>
      </div>

      <!-- Content panels -->
      <div class="content-area">
        <!-- Identity -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'identity' }">
          <!-- Species + Cultivar -->
          <div class="field-row">
            <div class="field" :class="{ 'field--invalid': showErrors && !form.species }">
              <span class="field__label">{{ t('admin.species') }} <span class="field__req">*</span></span>
              <div class="combobox" :class="{ 'combobox--open': speciesOpen }">
                <input
                  ref="speciesInput"
                  v-model="form.species"
                  class="combobox__input"
                  type="text"
                  :placeholder="t('admin.speciesPlaceholder')"
                  @focus="speciesOpen = true"
                  @input="speciesOpen = true"
                  @keydown.enter="speciesOpen = false"
                />
                <span class="material-icons-outlined combobox__icon">expand_more</span>
                <div class="combobox__dropdown">
                  <div
                    v-for="opt in filteredSpecies"
                    :key="opt"
                    class="combobox__option"
                    :class="{ 'combobox__option--active': opt === form.species }"
                    @mousedown.prevent="form.species = opt; speciesOpen = false"
                  >
                    {{ opt }}
                  </div>
                  <div v-if="filteredSpecies.length === 0" class="combobox__empty">
                    <span class="combobox__empty-primary">{{ t('admin.noMatch') }}</span>
                    <span class="combobox__empty-hint">{{ t('admin.addNewEntry') }}</span>
                  </div>
                </div>
              </div>
              <span class="field__error">{{ t('admin.required') }}</span>
            </div>
            <div class="field">
              <span class="field__label">{{ t('admin.variety') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
              <input v-model="form.variety" class="field__input" type="text" :placeholder="t('admin.varietyPlaceholder')" />
            </div>
          </div>

          <!-- Latin name -->
          <div class="field" :class="{ 'field--invalid': showErrors && !form.latinName }">
            <span class="field__label">{{ t('admin.latinName') }} <span class="field__req">*</span></span>
            <div class="combobox" :class="{ 'combobox--open': latinOpen }">
              <input
                v-model="form.latinName"
                class="combobox__input"
                type="text"
                :placeholder="t('admin.speciesPlaceholder')"
                @focus="latinOpen = true"
                @input="latinOpen = true"
                @keydown.enter="latinOpen = false"
              />
              <span class="material-icons-outlined combobox__icon">expand_more</span>
              <div class="combobox__dropdown">
                <div
                  v-for="opt in filteredLatinNames"
                  :key="opt"
                  class="combobox__option"
                  :class="{ 'combobox__option--active': opt === form.latinName }"
                  @mousedown.prevent="form.latinName = opt; latinOpen = false"
                >
                  {{ opt }}
                </div>
                <div v-if="filteredLatinNames.length === 0" class="combobox__empty">
                  <span class="combobox__empty-primary">{{ t('admin.noMatch') }}</span>
                  <span class="combobox__empty-hint">{{ t('admin.addNewEntry') }}</span>
                </div>
              </div>
            </div>
            <span class="field__error">{{ t('admin.required') }}</span>
          </div>

          <!-- Name NL + EN -->
          <div class="field-row">
            <div class="field" :class="{ 'field--invalid': showErrors && !form.name.nl }">
              <span class="field__label">{{ t('admin.plantName') }} NL <span class="field__req">*</span></span>
              <input v-model="form.name.nl" class="field__input" type="text" />
              <span class="field__error">{{ t('admin.required') }}</span>
            </div>
            <div class="field" :class="{ 'field--invalid': showErrors && !form.name.en }">
              <span class="field__label">{{ t('admin.plantName') }} EN <span class="field__req">*</span></span>
              <input v-model="form.name.en" class="field__input" type="text" />
              <span class="field__error">{{ t('admin.required') }}</span>
            </div>
          </div>

          <div class="section-divider" />

          <!-- Type radios -->
          <div class="field">
            <span class="field__label">{{ t('admin.type') }} <span class="field__req">*</span></span>
            <div class="type-radios">
              <button
                v-for="tp in typeOptions"
                :key="tp.value"
                class="type-radio"
                :class="[`type-radio--${tp.css}`, { 'type-radio--active': form.type === tp.value }]"
                @click="form.type = tp.value"
              >
                <span class="type-radio__circle">
                  <span class="material-icons-outlined">{{ tp.icon }}</span>
                </span>
                <span class="type-radio__label">{{ tp.label }}</span>
              </button>
            </div>
          </div>

          <!-- Lifecycle -->
          <div class="field">
            <span class="field__label">{{ t('admin.lifecycle') }} <span class="field__req">*</span></span>
            <div class="segment">
              <button
                v-for="lc in lifecycleOptions"
                :key="lc.value"
                class="segment__btn"
                :class="{ 'segment__btn--active': form.lifecycle === lc.value }"
                @click="form.lifecycle = lc.value"
              >
                <span class="material-icons-outlined segment-icon">{{ lc.icon }}</span>
                {{ lc.label }}
              </button>
            </div>
          </div>

          <!-- Propagation -->
          <div class="field">
            <span class="field__label">{{ t('admin.propagation') }} <span class="field__req">*</span></span>
            <div class="segment">
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.propagation === 'seed' }"
                @click="form.propagation = 'seed'"
              >
                <svg class="segment-svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C8 1 5 5 5 9c0 1.66 1.34 3 3 3s3-1.34 3-3C11 5 8 1 8 1z"/><path d="M8 5.5v4" stroke="white" stroke-width="0.8" fill="none" opacity="0.4"/></svg>
                {{ t('admin.propagationSeed') }}
              </button>
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.propagation === 'tuber' }"
                @click="form.propagation = 'tuber'"
              >
                <svg class="segment-svg segment-svg--tuber" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5C6.5 3.5 4 6 4 9c0 2.2 1.8 3.5 4 3.5s4-1.3 4-3.5c0-3-2.5-5.5-4-5.5z"/><path d="M8 5.5c-.8 1.2-1.2 2.5-1.2 3.8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/><path d="M7.2 3.8C7 2.8 7.3 1.5 8 1c.7.5 1 1.8.8 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 12.5c.2.5.2 1 .1 1.3M8 12.5v1.3M9.5 12.5c-.2.5-.2 1-.1 1.3" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round"/></svg>
                {{ t('admin.propagationTuber') }}
              </button>
            </div>
          </div>

          <!-- Germination (not for tubers) -->
          <div v-if="form.propagation !== 'tuber'" class="field">
            <span class="field__label">{{ t('admin.germination') }} <span class="field__req">*</span></span>
            <div class="segment">
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.germination === 'light' }"
                @click="form.germination = 'light'"
              >
                <span class="material-icons-outlined segment-icon">light_mode</span>
                {{ t('admin.lightGerminator') }}
              </button>
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.germination === 'dark' }"
                @click="form.germination = 'dark'"
              >
                <span class="material-icons-outlined segment-icon">dark_mode</span>
                {{ t('admin.darkGerminator') }}
              </button>
            </div>
          </div>
          <div v-else class="field">
            <span class="field__label">{{ t('admin.germination') }}</span>
            <div class="tuber-note">{{ t('admin.germNotApplicable') }}</div>
          </div>

          <!-- Colors -->
          <div class="field">
            <span class="field__label">{{ t('admin.colors') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <div class="color-swatches">
              <div
                v-for="(color, idx) in form.colors"
                :key="idx"
                class="color-swatch"
                :style="{ background: color.hex }"
                :title="color.name"
                @click="toggleSwatchRemove(idx)"
              >
                <span
                  class="color-swatch__remove"
                  :class="{ 'color-swatch__remove--visible': activeSwatchIdx === idx }"
                  @click.stop="removeColor(idx)"
                >
                  &times;
                </span>
              </div>
              <button class="color-add" @click.stop="showPalette = !showPalette">
                <span class="material-icons-outlined">add</span>
              </button>
              <div v-if="showPalette" class="color-palette color-palette--open">
                <div v-for="section in colorPaletteSections" :key="section.label" class="color-palette__section">
                  <div class="color-palette__label">{{ section.label }}</div>
                  <div class="color-palette__row">
                    <div
                      v-for="c in section.colors"
                      :key="c.hex"
                      class="color-palette__swatch"
                      :class="{ 'color-palette__swatch--light': isLightColor(c.hex) }"
                      :style="{ background: c.hex }"
                      :title="c.name"
                      @click.stop="addColor(c)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-divider" />

          <!-- Status -->
          <div class="field">
            <span class="field__label">Status <span class="field__req">*</span></span>
            <div class="status-group">
              <button
                v-for="s in statusOptions"
                :key="s.value"
                class="status-chip"
                :class="[`status-chip--${s.value}`, { 'status-chip--active': form.status === s.value }]"
                @click="form.status = s.value"
              >
                <span class="status-chip__dot" />
                {{ s.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'calendar' }">
          <div class="cal-legend">
            <div class="cal-legend__item"><span class="cal-legend__dot cal-legend__dot--indoor" /> {{ t('admin.indoorSowing') }}</div>
            <div class="cal-legend__item"><span class="cal-legend__dot cal-legend__dot--cold" /> {{ t('admin.coldGreenhouse') }}</div>
            <div class="cal-legend__item"><span class="cal-legend__dot cal-legend__dot--outdoor" /> {{ t('admin.outdoor') }}</div>
            <div class="cal-legend__item"><span class="cal-legend__dot cal-legend__dot--flowering" /> {{ form.type === 'flower' ? t('admin.harvestPeriodFlower') : t('admin.harvestPeriodOther') }}</div>
          </div>

          <MonthGrid
            v-model="form.calendar.indoorSowing"
            :label="form.propagation === 'tuber' ? t('calendar.preSproutIndoors') : t('admin.indoorSowing')"
            month-type="indoor"
            optional
          />
          <MonthGrid
            v-model="form.calendar.coldGreenhouse"
            :label="t('admin.coldGreenhouse')"
            month-type="cold"
            optional
          />
          <MonthGrid
            v-model="form.calendar.outdoor"
            :label="form.propagation === 'tuber' ? t('calendar.plantOutdoors') : t('admin.outdoor')"
            month-type="outdoor"
            optional
          />

          <div class="section-divider" />

          <MonthGrid
            v-model="form.calendar.harvestPeriod"
            :label="form.type === 'flower' ? t('admin.harvestPeriodFlower') : t('admin.harvestPeriodOther')"
            month-type="flowering"
            required
            :show-error="showErrors && !form.calendar.harvestPeriod"
          />
        </div>

        <!-- Growing -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'growing' }">
          <!-- Sun -->
          <div class="field">
            <span class="field__label">{{ t('admin.sun') }} <span class="field__req">*</span></span>
            <div class="segment">
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.sun === 'full-sun' }"
                @click="form.sun = 'full-sun'"
              >
                <span class="material-icons-outlined segment-icon">light_mode</span> {{ t('admin.fullSun') }}
              </button>
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.sun === 'partial-shade' }"
                @click="form.sun = 'partial-shade'"
              >
                <span class="material-icons-outlined segment-icon">contrast</span> {{ t('admin.partialShade') }}
              </button>
              <button
                class="segment__btn"
                :class="{ 'segment__btn--active': form.sun === 'shade' }"
                @click="form.sun = 'shade'"
              >
                <span class="material-icons-outlined segment-icon">wb_cloudy</span> {{ t('admin.shade') }}
              </button>
            </div>
          </div>

          <!-- Height range -->
          <div class="field">
            <span class="field__label">{{ t('admin.height') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <div class="range-pair">
              <input
                :value="form.heightCm?.min ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="min"
                @input="updateRange('heightCm', 'min', $event)"
              />
              <span class="range-pair__sep">&ndash;</span>
              <input
                :value="form.heightCm?.max ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="max"
                @input="updateRange('heightCm', 'max', $event)"
              />
            </div>
          </div>

          <!-- Germination days range (not for tubers) -->
          <div v-if="form.propagation !== 'tuber'" class="field">
            <span class="field__label">{{ t('admin.germinationDays') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <div class="range-pair">
              <input
                :value="form.germinationDays?.min ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="min"
                @input="updateRange('germinationDays', 'min', $event)"
              />
              <span class="range-pair__sep">&ndash;</span>
              <input
                :value="form.germinationDays?.max ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="max"
                @input="updateRange('germinationDays', 'max', $event)"
              />
            </div>
          </div>

          <!-- Germination temp range (not for tubers) -->
          <div v-if="form.propagation !== 'tuber'" class="field">
            <span class="field__label">{{ t('admin.germinationTemp') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <div class="range-pair">
              <input
                :value="form.germinationTempC?.min ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="min"
                @input="updateRange('germinationTempC', 'min', $event)"
              />
              <span class="range-pair__sep">&ndash;</span>
              <input
                :value="form.germinationTempC?.max ?? ''"
                class="range-pair__input"
                type="number"
                inputmode="numeric"
                placeholder="max"
                @input="updateRange('germinationTempC', 'max', $event)"
              />
            </div>
          </div>

          <!-- Depth + Seeds per cell -->
          <div class="field-row">
            <div class="field">
              <span class="field__label">{{ form.propagation === 'tuber' ? t('admin.plantingDepth') : t('admin.depth') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
              <input v-model.number="form.sowingDepthMm" class="field__input" type="number" inputmode="numeric" />
            </div>
            <div v-if="form.propagation !== 'tuber'" class="field">
              <span class="field__label">{{ t('admin.seedsPerCellShort') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
              <input v-model.number="form.seedsPerCell" class="field__input" type="number" inputmode="numeric" />
            </div>
          </div>

          <!-- Plant spacing -->
          <div class="field" :class="{ 'field--invalid': showErrors && !form.minDistanceCm }">
            <span class="field__label">{{ t('admin.plantSpacing') }} <span class="field__req">*</span></span>
            <input v-model.number="form.minDistanceCm" class="field__input" type="number" inputmode="numeric" />
            <span class="field__error">{{ t('admin.required') }}</span>
          </div>

          <div class="section-divider" />

          <!-- Planting conditions -->
          <div class="field">
            <span class="field__label">{{ t('admin.plantingConditions') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <div class="chip-group">
              <span
                v-for="cond in conditionOptions"
                :key="cond.value"
                class="chip"
                :class="{ 'chip--on': form.plantingConditions.includes(cond.value) }"
                @click="toggleCondition(cond.value)"
              >
                {{ cond.label }}
              </span>
            </div>
          </div>

          <!-- Pinching toggle -->
          <div class="toggle-row">
            <div>
              <div class="toggle-row__label">{{ t('admin.pinching') }}</div>
              <div class="toggle-row__sub">{{ t('admin.encouragesBranching') }}</div>
            </div>
            <button
              class="toggle"
              :class="{ 'toggle--on': form.pinching }"
              @click="form.pinching = !form.pinching"
            />
          </div>
        </div>

        <!-- Care -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'care' }">
          <p class="care-intro">{{ t('admin.orderedCareSteps') }}</p>
          <div class="care-list">
            <div
              v-for="(step, idx) in form.careSteps"
              :key="step.order"
              class="care-step"
              :class="{ 'care-step--dragging': dragIdx === idx, 'care-step--over': dragOverIdx === idx && dragIdx !== idx }"
              draggable="true"
              @dragstart="onDragStart(idx, $event)"
              @dragover.prevent="onDragOver(idx)"
              @dragenter.prevent
              @drop="onDrop(idx)"
              @dragend="onDragEnd"
            >
              <span class="care-step__num">{{ idx + 1 }}</span>
              <div class="care-step__body">
                <div class="care-step__action">{{ localize(step.action) }}</div>
                <div class="care-step__cond">
                  <span class="material-icons-outlined" style="font-size:12px; vertical-align:-2px; margin-right:2px;">{{ conditionIcon(step.condition.type) }}</span>
                  {{ localize(step.condition.description) }}
                </div>
              </div>
              <button class="care-step__delete" @click="removeCareStep(idx)">
                <span class="material-icons-outlined">close</span>
              </button>
              <span class="care-step__drag">
                <span class="material-icons-outlined">drag_indicator</span>
              </span>
            </div>
          </div>

          <button
            v-if="!showCareForm"
            class="care-add"
            @click="showCareForm = true"
          >
            <span class="material-icons-outlined">add</span>
            {{ t('admin.addStep') }}
          </button>

          <div v-if="showCareForm" class="care-form">
            <div class="care-form__row">
              <div class="care-form__field">
                <span class="care-form__label">{{ t('admin.actionNl') }}</span>
                <input v-model="newStep.action.nl" class="care-form__input" type="text" :placeholder="t('admin.actionNl')" />
              </div>
              <div class="care-form__field">
                <span class="care-form__label">{{ t('admin.actionEn') }}</span>
                <input v-model="newStep.action.en" class="care-form__input" type="text" :placeholder="t('admin.actionEn')" />
              </div>
            </div>
            <div class="care-form__cond-label">{{ t('admin.when') }}</div>
            <div class="care-form__cond-chips">
              <span
                v-for="ct in conditionTypes"
                :key="ct.value"
                class="care-form__cond-chip"
                :class="{ 'care-form__cond-chip--active': newStep.condition.type === ct.value }"
                @click="newStep.condition.type = ct.value"
              >
                <span class="material-icons-outlined">{{ ct.icon }}</span>
                {{ ct.label }}
              </span>
            </div>
            <div class="care-form__row">
              <div class="care-form__field">
                <span class="care-form__label">{{ t('admin.conditionNl') }}</span>
                <input v-model="newStep.condition.description.nl" class="care-form__input" type="text" :placeholder="t('admin.conditionNl')" />
              </div>
              <div class="care-form__field">
                <span class="care-form__label">{{ t('admin.conditionEn') }}</span>
                <input v-model="newStep.condition.description.en" class="care-form__input" type="text" :placeholder="t('admin.conditionEn')" />
              </div>
            </div>
            <div class="care-form__actions">
              <button class="care-form__btn care-form__btn--cancel" @click="showCareForm = false">
                {{ t('admin.cancel') }}
              </button>
              <button class="care-form__btn care-form__btn--save" @click="addCareStep">
                {{ t('admin.addStep') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'notes' }">
          <div class="field">
            <span class="field__label">{{ t('admin.maintenanceNl') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <textarea v-model="form.maintenanceNotes.nl" class="field__textarea" :placeholder="t('admin.careTips')" />
          </div>
          <div class="field">
            <span class="field__label">{{ t('admin.maintenanceEn') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <textarea v-model="form.maintenanceNotes.en" class="field__textarea" :placeholder="t('admin.careTips')" />
          </div>

          <div class="section-divider" />

          <div class="field">
            <span class="field__label">{{ t('admin.stemTipsNl') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <textarea v-model="stemTipsLocal.nl" class="field__textarea" :placeholder="t('admin.optionalTips')" />
          </div>
          <div class="field">
            <span class="field__label">{{ t('admin.stemTipsEn') }} <span class="field__opt">{{ t('admin.optional') }}</span></span>
            <textarea v-model="stemTipsLocal.en" class="field__textarea" :placeholder="t('admin.optionalTips')" />
          </div>
        </div>

        <!-- Images -->
        <div class="panel" :class="{ 'panel--active': activeTab === 'images' }">
          <!-- Cover preview -->
          <div v-if="coverImage" class="img-cover-section">
            <div class="field__label" style="margin-bottom: 6px;">
              {{ t('admin.coverPhoto') }}
              <span class="field__opt">{{ t('admin.clickFocalPoint') }}</span>
            </div>
            <div
              class="img-cover-preview"
              :class="{ 'img-cover-preview--zoomed': coverZoom > 1, 'img-cover-preview--panning': isPanning && activePanTarget === 'cover' }"
              @click="handleCoverFocalClick"
              @wheel.prevent="handleWheel($event, 'cover')"
              @mousedown="handlePanStart($event, 'cover')"
              @mousemove="handlePanMove"
              @mouseup="handlePanEnd"
              @mouseleave="handlePanEnd"
            >
              <img
                :src="coverImage.url"
                alt="Cover"
                :style="{
                  ...(coverImage.focalPoint
                    ? { objectPosition: `${coverImage.focalPoint.x}% ${coverImage.focalPoint.y}%` }
                    : {}),
                  transform: `scale(${coverZoom}) translate(${coverPan.x / coverZoom}px, ${coverPan.y / coverZoom}px)`,
                }"
              />
              <div
                class="img-focal-point"
                :style="{
                  left: (coverImage.focalPoint?.x ?? 50) + '%',
                  top: (coverImage.focalPoint?.y ?? 50) + '%',
                }"
              />
              <div class="img-cover-badge">
                <span class="material-icons-outlined">star</span>
                Cover
              </div>
              <div v-if="coverZoom > 1" class="img-zoom-pill">{{ Math.round(coverZoom * 100) }}%</div>
              <div class="img-focal-hint">{{ coverZoom > 1 ? t('admin.zoomHint') : t('admin.clickFocalPoint') }}</div>
            </div>
          </div>

          <!-- Card preview + info row -->
          <div v-if="cardPreviewImage" class="img-card-section">
            <div class="field__label" style="margin-bottom: 6px;">
              {{ t('admin.cardPreview') }}
              <span class="field__opt">{{ t('admin.clickCropCenter') }}</span>
            </div>
            <div class="img-card-row">
              <div
                class="img-card-thumb"
                :class="{ 'img-card-thumb--zoomed': cardZoom > 1, 'img-card-thumb--panning': isPanning && activePanTarget === 'card' }"
                @click="handleThumbFocalClick"
                @wheel.prevent="handleWheel($event, 'card')"
                @mousedown="handlePanStart($event, 'card')"
                @mousemove="handlePanMove"
                @mouseup="handlePanEnd"
                @mouseleave="handlePanEnd"
              >
                <img
                  :src="cardPreviewImage.url"
                  alt="Card preview"
                  :style="{
                    ...(cardPreviewImage.thumbFocalPoint
                      ? { objectPosition: `${cardPreviewImage.thumbFocalPoint.x}% ${cardPreviewImage.thumbFocalPoint.y}%` }
                      : {}),
                    transform: `scale(${cardZoom}) translate(${cardPan.x / cardZoom}px, ${cardPan.y / cardZoom}px)`,
                  }"
                />
                <div
                  class="img-focal-point img-focal-point--small"
                  :style="{
                    left: (cardPreviewImage.thumbFocalPoint?.x ?? 50) + '%',
                    top: (cardPreviewImage.thumbFocalPoint?.y ?? 50) + '%',
                  }"
                />
                <div v-if="cardZoom > 1" class="img-zoom-pill img-zoom-pill--small">{{ Math.round(cardZoom * 100) }}%</div>
              </div>
              <div class="img-card-info">
                <p><strong>{{ t('admin.coverPhoto') }}</strong> {{ t('admin.coverDesc') }}</p>
                <p><strong>{{ t('admin.cardPreview') }}</strong> {{ t('admin.cardDesc') }}</p>
              </div>
            </div>
          </div>

          <div v-if="normalizedImages.length" class="section-divider" />

          <!-- Image count -->
          <div v-if="normalizedImages.length" class="img-count">
            <div class="img-count__text">
              <strong>{{ normalizedImages.length }}</strong> {{ normalizedImages.length === 1 ? 'image' : 'images' }}
            </div>
          </div>

          <!-- Gallery grid (only when images exist) -->
          <div v-if="normalizedImages.length > 0" class="img-gallery">
            <div
              v-for="(img, idx) in normalizedImages"
              :key="img.url"
              class="img-item"
              :class="{ 'img-item--cover': idx === coverIndex, 'img-item--card': idx === cardPreviewIndex }"
            >
              <img :src="img.url" alt="" loading="lazy" />
              <div class="img-item__actions">
                <div class="img-item__actions-left">
                  <button
                    class="img-item__btn img-item__btn--star"
                    :class="{ active: idx === coverIndex }"
                    :title="idx === coverIndex ? 'Cover photo' : 'Set as cover'"
                    @click="setCover(idx)"
                  >
                    <span class="material-icons-outlined">{{ idx === coverIndex ? 'star' : 'star_border' }}</span>
                  </button>
                  <button
                    class="img-item__btn img-item__btn--crop"
                    :class="{ active: idx === cardPreviewIndex }"
                    :title="t('admin.setAsCardPreview')"
                    @click="setCardPreview(idx)"
                  >
                    <span class="material-icons-outlined">crop</span>
                  </button>
                </div>
                <button
                  class="img-item__btn img-item__btn--delete"
                  :title="t('admin.imageRemoved')"
                  @click="removeImage(idx)"
                >
                  <span class="material-icons-outlined">delete_outline</span>
                </button>
              </div>
              <div class="img-item__tags">
                <div v-if="idx === coverIndex" class="img-item__cover-tag">Cover</div>
                <div v-if="idx === cardPreviewIndex" class="img-item__card-tag">{{ t('admin.cardPreviewTag') }}</div>
              </div>
            </div>

            <button class="img-add" @click="toggleUploadZone">
              <span class="material-icons-outlined">add_photo_alternate</span>
              <span>{{ t('admin.add') }}</span>
            </button>
          </div>

          <!-- Focal point editor -->
          <div v-if="editingFocalIdx !== null && normalizedImages[editingFocalIdx]" class="img-focal-editor">
            <div class="img-focal-editor__header">
              <div class="img-focal-editor__title">{{ t('admin.adjustPosition') }}</div>
              <div class="img-focal-editor__mode-toggle">
                <button
                  class="img-focal-editor__mode-btn"
                  :class="{ 'img-focal-editor__mode-btn--active': focalEditMode === 'cover' }"
                  @click="focalEditMode = 'cover'"
                >
                  {{ t('admin.coverFocal') }}
                </button>
                <button
                  class="img-focal-editor__mode-btn"
                  :class="{ 'img-focal-editor__mode-btn--active': focalEditMode === 'card' }"
                  @click="focalEditMode = 'card'"
                >
                  {{ t('admin.cardFocal') }}
                </button>
              </div>
              <button class="img-focal-editor__close" @click="editingFocalIdx = null">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
            <div
              class="img-focal-editor__image"
              :class="{
                'img-focal-editor__image--zoomed': focalEditorZoom > 1,
                'img-focal-editor__image--panning': isPanning && activePanTarget === 'focal',
                'img-focal-editor__image--card-mode': focalEditMode === 'card',
              }"
              @click="handleFocalEditorClick"
              @wheel.prevent="handleWheel($event, 'focal')"
              @mousedown="handlePanStart($event, 'focal')"
              @mousemove="handlePanMove"
              @mouseup="handlePanEnd"
              @mouseleave="handlePanEnd"
            >
              <img
                :src="normalizedImages[editingFocalIdx]!.url"
                alt=""
                :style="{
                  transform: `scale(${focalEditorZoom}) translate(${focalEditorPan.x / focalEditorZoom}px, ${focalEditorPan.y / focalEditorZoom}px)`,
                }"
              />
              <!-- Cover focal point (white) -->
              <div
                class="img-focal-point"
                :style="{
                  left: (normalizedImages[editingFocalIdx]!.focalPoint?.x ?? 50) + '%',
                  top: (normalizedImages[editingFocalIdx]!.focalPoint?.y ?? 50) + '%',
                }"
              />
              <!-- Card focal point (clay) -->
              <div
                class="img-focal-point img-focal-point--card"
                :style="{
                  left: (normalizedImages[editingFocalIdx]!.thumbFocalPoint?.x ?? 50) + '%',
                  top: (normalizedImages[editingFocalIdx]!.thumbFocalPoint?.y ?? 50) + '%',
                }"
              />
              <div v-if="focalEditorZoom > 1" class="img-zoom-pill">{{ Math.round(focalEditorZoom * 100) }}%</div>
              <div class="img-focal-hint">{{ focalEditorZoom > 1 ? t('admin.zoomHint') : t('admin.clickFocalPoint') }}</div>
            </div>
          </div>

          <!-- Upload zone -->
          <div v-if="showUploadZone" class="img-upload-zone">
            <div class="img-upload-zone__icon">
              <span class="material-icons-outlined">cloud_upload</span>
            </div>
            <div class="img-upload-zone__text">{{ t('admin.dropOrUpload') }}</div>
            <div class="img-upload-zone__hint">{{ t('admin.autoCompressed') }}</div>
            <button class="img-upload-zone__file-btn" @click="triggerFileInput">
              <span class="material-icons-outlined">folder_open</span>
              {{ t('admin.chooseFile') }}
            </button>
            <input
              id="imageFileInput"
              type="file"
              accept="image/*"
              multiple
              style="display: none"
              @change="handleFileUpload"
            />
            <div class="img-upload-zone__or">{{ t('admin.orPasteUrl') }}</div>
            <div class="img-upload-zone__url-row">
              <input
                v-model="urlInput"
                class="img-upload-zone__url-input"
                type="text"
                placeholder="https://example.com/photo.jpg"
                @keydown.enter="addImageFromUrl"
              />
              <button class="img-upload-zone__url-btn" :disabled="uploading" @click="addImageFromUrl">
                {{ t('admin.add') }}
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="normalizedImages.length === 0 && !showUploadZone" class="img-cover-preview img-cover-preview--empty" @click="toggleUploadZone">
            <div class="img-empty-state">
              <span class="material-icons-outlined">add_photo_alternate</span>
              <span>{{ t('admin.addFirstImage') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Save bar -->
      <div class="save-bar">
        <button
          class="save-btn"
          :class="{ 'save-btn--shake': saveShake }"
          :disabled="!isDirty"
          @click="handleSave"
        >
          <span class="material-icons-outlined">check_circle</span>
          {{ t('admin.saveChanges') }}
        </button>
      </div>

      <!-- Discard dialog -->
      <q-dialog v-model="showDiscard" persistent>
        <div class="discard-dialog">
          <div class="discard-dialog__icon-wrap">
            <span class="material-icons-outlined">edit_off</span>
          </div>
          <div class="discard-dialog__title">{{ t('admin.unsavedChanges') }}</div>
          <div class="discard-dialog__text">{{ t('admin.unsavedChangesText') }}</div>
          <div class="discard-dialog__actions">
            <button class="discard-dialog__btn discard-dialog__btn--cancel" @click="showDiscard = false">
              {{ t('admin.keepEditing') }}
            </button>
            <button class="discard-dialog__btn discard-dialog__btn--confirm" @click="confirmDiscard">
              {{ t('admin.discard') }}
            </button>
          </div>
        </div>
      </q-dialog>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { usePlantStore } from 'src/stores/plant-store';
import { savePlant, createPlant } from 'src/services/plant-service';
import { useLocale } from 'src/composables/useLocale';
import { colorHexMap } from 'src/data/color-map';
import type {
  Plant,
  PlantType,
  PlantLifecycle,
  PlantStatus,
  PlantingCondition,
  BilingualText,
  CareConditionType,
  CareStep,
  PlantColor,
  PlantImage,
} from 'src/types/plant';
import { normalizeImage } from 'src/types/plant';
import { compressImage, uploadPlantImage, processAndUploadImage } from 'src/services/image-service';
import LanguageToggle from 'src/components/layout/LanguageToggle.vue';
import MonthGrid from './MonthGrid.vue';

type TabId = 'identity' | 'calendar' | 'growing' | 'care' | 'notes' | 'images';
type RangeField = 'heightCm' | 'germinationDays' | 'germinationTempC';

const props = defineProps<{
  modelValue: boolean;
  plantId?: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const $q = useQuasar();
const { t } = useI18n();
const plantStore = usePlantStore();
const { localize } = useLocale();

const activeTab = ref<TabId>('identity');
const showErrors = ref(false);
const showDiscard = ref(false);
const showCareForm = ref(false);
const showPalette = ref(false);
const speciesOpen = ref(false);
const latinOpen = ref(false);
const activeSwatchIdx = ref<number | null>(null);
const saveShake = ref(false);
const speciesInput = ref<HTMLInputElement | null>(null);
const dragIdx = ref<number | null>(null);
const dragOverIdx = ref<number | null>(null);

function emptyPlant(): Plant {
  return {
    id: '',
    species: '',
    variety: null,
    latinName: '',
    name: { nl: '', en: '' },
    type: 'flower',
    lifecycle: 'annual',
    calendar: { indoorSowing: null, coldGreenhouse: null, outdoor: null, harvestPeriod: null },
    germination: 'light',
    colors: [],
    images: [],
    heightCm: null,
    sowingDepthMm: null,
    germinationDays: null,
    germinationTempC: null,
    pinching: false,
    seedsPerCell: null,
    careSteps: [],
    maintenanceNotes: { nl: '', en: '' },
    plantingConditions: [],
    minDistanceCm: 20,
    stemTips: null,
    sun: 'full-sun',
    propagation: 'seed',
    status: 'pending',
  };
}

const form = ref<Plant>(emptyPlant());
const stemTipsLocal = ref<BilingualText>({ nl: '', en: '' });
const initialSnapshot = ref('');

const isNew = computed(() => !props.plantId);

// Load plant data when dialog opens or plantId changes
watch(
  () => [props.modelValue, props.plantId],
  ([open]) => {
    if (open) {
      activeTab.value = 'identity';
      showErrors.value = false;
      showCareForm.value = false;
      showPalette.value = false;

      if (props.plantId) {
        const plant = plantStore.getPlantById(props.plantId);
        if (plant) {
          form.value = JSON.parse(JSON.stringify(plant)) as Plant;
          // Ensure fields exist (backward compat)
          if (!form.value.calendar.harvestPeriod) {
            form.value.calendar.harvestPeriod = null;
          }
          if (!form.value.lifecycle) {
            form.value.lifecycle = 'annual';
          }
          if (!form.value.propagation) {
            form.value.propagation = 'seed';
          }
          stemTipsLocal.value = form.value.stemTips
            ? { ...form.value.stemTips }
            : { nl: '', en: '' };
        }
      } else {
        form.value = emptyPlant();
        stemTipsLocal.value = { nl: '', en: '' };
      }

      void nextTick(() => {
        initialSnapshot.value = JSON.stringify({ form: form.value, stemTips: stemTipsLocal.value });
      });
    }
  },
  { immediate: true },
);

const isDirty = computed(() => {
  const current = JSON.stringify({ form: form.value, stemTips: stemTipsLocal.value });
  return current !== initialSnapshot.value;
});

// Tab definitions
const tabs = computed(() => [
  { id: 'identity' as TabId, icon: 'badge', label: t('admin.identity'), badge: true },
  { id: 'calendar' as TabId, icon: 'date_range', label: t('admin.calendar'), badge: true },
  { id: 'growing' as TabId, icon: 'wb_sunny', label: t('admin.growing'), badge: true },
  { id: 'care' as TabId, icon: 'checklist', label: t('admin.care'), badge: false },
  { id: 'notes' as TabId, icon: 'notes', label: t('admin.notes'), badge: false },
  { id: 'images' as TabId, icon: 'photo_library', label: t('admin.images'), badge: false },
]);

// Required field counts per tab
function identityFilledCount() {
  let count = 0;
  if (form.value.species) count++;
  if (form.value.latinName) count++;
  if (form.value.name.nl) count++;
  if (form.value.name.en) count++;
  if (form.value.type) count++;
  if (form.value.lifecycle) count++;
  if (form.value.germination) count++;
  if (form.value.status) count++;
  return count;
}
const identityTotal = 8;

function calendarFilledCount() {
  return form.value.calendar.harvestPeriod ? 1 : 0;
}
const calendarTotal = 1;

function growingFilledCount() {
  let count = 0;
  if (form.value.sun) count++;
  if (form.value.minDistanceCm) count++;
  return count;
}
const growingTotal = 2;

function tabBadgeText(tabId: TabId): string {
  if (tabId === 'identity') return `${identityFilledCount()}/${identityTotal}`;
  if (tabId === 'calendar') return `${calendarFilledCount()}/${calendarTotal}`;
  if (tabId === 'growing') return `${growingFilledCount()}/${growingTotal}`;
  return '';
}

function tabBadgeClass(tabId: TabId): string {
  const filled = tabId === 'identity' ? identityFilledCount() : tabId === 'calendar' ? calendarFilledCount() : growingFilledCount();
  const total = tabId === 'identity' ? identityTotal : tabId === 'calendar' ? calendarTotal : growingTotal;
  if (showErrors.value && filled < total) return 'tab__badge--error';
  if (filled === total) return '';
  if (filled > 0) return 'tab__badge--warn';
  return 'tab__badge--empty';
}

// Species / Latin name comboboxes
const allSpecies = computed(() => {
  const set = new Set(plantStore.plants.map((p) => p.species));
  return [...set].sort();
});
const allLatinNames = computed(() => {
  const set = new Set(plantStore.plants.map((p) => p.latinName).filter(Boolean));
  return [...set].sort();
});
const filteredSpecies = computed(() => {
  const q = form.value.species.toLowerCase();
  if (!q) return allSpecies.value;
  return allSpecies.value.filter((s) => s.toLowerCase().includes(q));
});
const filteredLatinNames = computed(() => {
  const q = form.value.latinName.toLowerCase();
  if (!q) return allLatinNames.value;
  return allLatinNames.value.filter((s) => s.toLowerCase().includes(q));
});

// Close comboboxes on outside click
function handleClickOutside(e: Event) {
  const target = e.target as HTMLElement;
  if (!target.closest('.combobox')) {
    speciesOpen.value = false;
    latinOpen.value = false;
  }
  if (!target.closest('.color-add') && !target.closest('.color-palette')) {
    showPalette.value = false;
  }
}
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  },
);

// Type options
const typeIconMap: Record<string, string> = { flower: 'local_florist', herb: 'grass', vegetable: 'spa' };
function typeIcon(type: string) { return typeIconMap[type] ?? 'local_florist'; }

const typeOptions = computed(() => [
  { value: 'flower' as PlantType, css: 'flower', icon: 'local_florist', label: t('admin.flower') },
  { value: 'herb' as PlantType, css: 'herb', icon: 'grass', label: t('admin.herb') },
  { value: 'vegetable' as PlantType, css: 'veg', icon: 'spa', label: t('admin.vegetable') },
]);

// Lifecycle options
const lifecycleOptions = computed(() => [
  { value: 'annual' as PlantLifecycle, icon: 'filter_1', label: t('admin.annual') },
  { value: 'biennial' as PlantLifecycle, icon: 'filter_2', label: t('admin.biennial') },
  { value: 'perennial' as PlantLifecycle, icon: 'all_inclusive', label: t('admin.perennial') },
]);

// Status options
const statusOptions = computed(() => [
  { value: 'pending' as PlantStatus, label: t('admin.pendingPlants') },
  { value: 'unverified' as PlantStatus, label: t('admin.unverifiedPlants') },
  { value: 'verified' as PlantStatus, label: t('admin.verifiedPlants') },
]);

// Condition options
const conditionOptions = computed(() => [
  { value: 'tray' as PlantingCondition, label: t('plant.tray') },
  { value: 'pot' as PlantingCondition, label: t('plant.pot') },
  { value: 'outdoor' as PlantingCondition, label: t('plant.outdoor') },
  { value: 'sprout-tray' as PlantingCondition, label: t('plant.sprout-tray') },
]);

function toggleCondition(cond: PlantingCondition) {
  const idx = form.value.plantingConditions.indexOf(cond);
  if (idx >= 0) {
    form.value.plantingConditions.splice(idx, 1);
  } else {
    form.value.plantingConditions.push(cond);
  }
}

// Range field helpers
function updateRange(field: RangeField, side: 'min' | 'max', event: Event) {
  const val = Number((event.target as HTMLInputElement).value);
  const current = form.value[field];
  if (!val && val !== 0) {
    // If both sides would be empty, set to null
    if (current) {
      const other = side === 'min' ? current.max : current.min;
      if (!other) {
        (form.value[field] as null) = null;
        return;
      }
    }
  }
  const existing = current ?? { min: 0, max: 0 };
  (form.value[field] as { min: number; max: number }) = {
    ...existing,
    [side]: val || 0,
  };
}

// Color palette
const colorPaletteSections = computed(() => [
  {
    label: 'Reds & Pinks',
    colors: ['red', 'dark red', 'crimson', 'rose', 'pink', 'dusty pink', 'blush', 'salmon', 'coral', 'burgundy', 'magenta']
      .map((name) => ({ name, hex: colorHexMap[name] ?? '#888' })),
  },
  {
    label: 'Oranges & Yellows',
    colors: ['orange', 'apricot', 'peach', 'terracotta', 'yellow', 'golden yellow', 'gold', 'lemon', 'straw']
      .map((name) => ({ name, hex: colorHexMap[name] ?? '#888' })),
  },
  {
    label: 'Greens',
    colors: ['green', 'lime green', 'chartreuse']
      .map((name) => ({ name, hex: colorHexMap[name] ?? '#888' })),
  },
  {
    label: 'Blues & Purples',
    colors: ['blue', 'cornflower blue', 'pale blue', 'lavender', 'lilac', 'purple', 'violet']
      .map((name) => ({ name, hex: colorHexMap[name] ?? '#888' })),
  },
  {
    label: 'Neutrals',
    colors: ['white', 'cream', 'ivory', 'bronze', 'dark brown']
      .map((name) => ({ name, hex: colorHexMap[name] ?? '#888' })),
  },
]);

function isLightColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 220;
}

function addColor(c: PlantColor) {
  if (form.value.colors.some((existing) => existing.hex.toUpperCase() === c.hex.toUpperCase())) return;
  form.value.colors.push({ ...c });
  showPalette.value = false;
}

function removeColor(idx: number) {
  form.value.colors.splice(idx, 1);
  activeSwatchIdx.value = null;
}

function toggleSwatchRemove(idx: number) {
  activeSwatchIdx.value = activeSwatchIdx.value === idx ? null : idx;
}

// Care steps
const conditionTypes = computed(() => [
  { value: 'days' as CareConditionType, icon: 'schedule', label: t('admin.days') },
  { value: 'height' as CareConditionType, icon: 'straighten', label: t('admin.heightCond') },
  { value: 'leaves' as CareConditionType, icon: 'eco', label: t('admin.leaves') },
  { value: 'temperature' as CareConditionType, icon: 'thermostat', label: t('admin.temp') },
  { value: 'date' as CareConditionType, icon: 'event', label: t('admin.date') },
  { value: 'custom' as CareConditionType, icon: 'tune', label: t('admin.other') },
]);

function conditionIcon(type: CareConditionType): string {
  return conditionTypes.value.find((ct) => ct.value === type)?.icon ?? 'tune';
}

function emptyStep(): CareStep {
  return {
    action: { nl: '', en: '' },
    condition: {
      type: 'days',
      value: null,
      unit: null,
      description: { nl: '', en: '' },
    },
    order: form.value.careSteps.length + 1,
  };
}

const newStep = ref<CareStep>(emptyStep());

function addCareStep() {
  if (!newStep.value.action.nl && !newStep.value.action.en) return;
  newStep.value.order = form.value.careSteps.length + 1;
  form.value.careSteps.push({ ...newStep.value, condition: { ...newStep.value.condition, description: { ...newStep.value.condition.description } }, action: { ...newStep.value.action } });
  newStep.value = emptyStep();
  showCareForm.value = false;
}

function removeCareStep(idx: number) {
  form.value.careSteps.splice(idx, 1);
  form.value.careSteps.forEach((step, i) => { step.order = i + 1; });
}

// Drag and drop
function onDragStart(idx: number, e: DragEvent) {
  dragIdx.value = idx;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
}

function onDragOver(idx: number) {
  dragOverIdx.value = idx;
}

function onDrop(idx: number) {
  if (dragIdx.value === null || dragIdx.value === idx) return;
  const steps = form.value.careSteps;
  const [moved] = steps.splice(dragIdx.value, 1);
  if (moved) {
    steps.splice(idx, 0, moved);
    steps.forEach((step, i) => { step.order = i + 1; });
  }
}

function onDragEnd() {
  dragIdx.value = null;
  dragOverIdx.value = null;
}

// Validation
function validate(): boolean {
  const errors: TabId[] = [];
  if (!form.value.species || !form.value.latinName || !form.value.name.nl || !form.value.name.en) {
    errors.push('identity');
  }
  if (!form.value.calendar.harvestPeriod) {
    errors.push('calendar');
  }
  if (!form.value.minDistanceCm) {
    errors.push('growing');
  }
  if (errors.length > 0) {
    showErrors.value = true;
    activeTab.value = errors[0]!;
    saveShake.value = true;
    setTimeout(() => { saveShake.value = false; }, 600);
    $q.notify({ type: 'negative', message: t('admin.fillRequired'), position: 'top' });
    return false;
  }
  return true;
}

function generateId(species: string, variety: string | null): string {
  const parts = [species, variety].filter(Boolean).join(' ');
  return parts.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Image management ──
const showUploadZone = ref(false);
const urlInput = ref('');
const uploading = ref(false);
const editingFocalIdx = ref<number | null>(null);
const focalEditMode = ref<'cover' | 'card'>('cover');

// Zoom/pan state for cover, card, and focal editor previews
const coverZoom = ref(1);
const coverPan = ref({ x: 0, y: 0 });
const cardZoom = ref(1);
const cardPan = ref({ x: 0, y: 0 });
const focalEditorZoom = ref(1);
const focalEditorPan = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const panStartOffset = ref({ x: 0, y: 0 });
const activePanTarget = ref<'cover' | 'card' | 'focal' | null>(null);

const normalizedImages = computed(() =>
  form.value.images.map(normalizeImage)
);

const coverIndex = computed(() => {
  const idx = normalizedImages.value.findIndex(i => i.isCover);
  return idx >= 0 ? idx : 0;
});

const coverImage = computed(() =>
  normalizedImages.value.length > 0 ? normalizedImages.value[coverIndex.value] ?? null : null
);

const cardPreviewIndex = computed(() => {
  const idx = normalizedImages.value.findIndex(i => i.isCardPreview);
  return idx >= 0 ? idx : coverIndex.value;
});

const cardPreviewImage = computed(() =>
  normalizedImages.value.length > 0 ? normalizedImages.value[cardPreviewIndex.value] ?? null : null
);

function setCover(idx: number) {
  form.value.images = form.value.images.map((img, i) => {
    const n = normalizeImage(img);
    return { ...n, isCover: i === idx };
  });
}

function setCardPreview(idx: number) {
  form.value.images = form.value.images.map((img, i) => {
    const n = normalizeImage(img);
    return { ...n, isCardPreview: i === idx };
  });
}

function removeImage(idx: number) {
  if (editingFocalIdx.value === idx) editingFocalIdx.value = null;
  const updated = [...form.value.images];
  updated.splice(idx, 1);
  const normalized = updated.map(normalizeImage);
  if (normalized.length > 0 && !normalized.some(i => i.isCover)) {
    updated[0] = { ...normalizeImage(updated[0]!), isCover: true };
  }
  form.value.images = updated;
}

function setImageFocalPoint(idx: number, x: number, y: number) {
  const img = normalizeImage(form.value.images[idx]!);
  form.value.images[idx] = { ...img, focalPoint: { x, y } };
}

function setThumbFocalPoint(idx: number, x: number, y: number) {
  const img = normalizeImage(form.value.images[idx]!);
  form.value.images[idx] = { ...img, thumbFocalPoint: { x, y } };
}

function getZoomPanRefs(target: 'cover' | 'card' | 'focal') {
  if (target === 'cover') return { zoom: coverZoom, pan: coverPan };
  if (target === 'card') return { zoom: cardZoom, pan: cardPan };
  return { zoom: focalEditorZoom, pan: focalEditorPan };
}

function handleWheel(e: WheelEvent, target: 'cover' | 'card' | 'focal') {
  const { zoom, pan } = getZoomPanRefs(target);
  const delta = e.deltaY > 0 ? -0.25 : 0.25;
  const newZoom = Math.min(5, Math.max(1, zoom.value + delta));
  zoom.value = newZoom;
  if (newZoom === 1) pan.value = { x: 0, y: 0 };
}

function handlePanStart(e: MouseEvent, target: 'cover' | 'card' | 'focal') {
  const { zoom } = getZoomPanRefs(target);
  if (zoom.value <= 1) return;
  isPanning.value = true;
  activePanTarget.value = target;
  const { pan } = getZoomPanRefs(target);
  panStart.value = { x: e.clientX, y: e.clientY };
  panStartOffset.value = { x: pan.value.x, y: pan.value.y };
  e.preventDefault();
}

function handlePanMove(e: MouseEvent) {
  if (!isPanning.value || !activePanTarget.value) return;
  const { pan } = getZoomPanRefs(activePanTarget.value);
  pan.value = {
    x: panStartOffset.value.x + (e.clientX - panStart.value.x),
    y: panStartOffset.value.y + (e.clientY - panStart.value.y),
  };
}

function handlePanEnd() {
  isPanning.value = false;
  activePanTarget.value = null;
}

function computeFocalFromEvent(event: MouseEvent, target: 'cover' | 'card' | 'focal'): { x: number; y: number } {
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const { zoom, pan } = getZoomPanRefs(target);
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const x = Math.round(((clickX - pan.value.x) / zoom.value) / rect.width * zoom.value * 100);
  const y = Math.round(((clickY - pan.value.y) / zoom.value) / rect.height * zoom.value * 100);
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

function handleCoverFocalClick(event: MouseEvent) {
  if (isPanning.value) return;
  const { x, y } = computeFocalFromEvent(event, 'cover');
  setImageFocalPoint(coverIndex.value, x, y);
}

function handleThumbFocalClick(event: MouseEvent) {
  if (isPanning.value) return;
  const { x, y } = computeFocalFromEvent(event, 'card');
  setThumbFocalPoint(cardPreviewIndex.value, x, y);
}

function handleFocalEditorClick(event: MouseEvent) {
  if (editingFocalIdx.value === null || isPanning.value) return;
  const { x, y } = computeFocalFromEvent(event, 'focal');
  if (focalEditMode.value === 'cover') {
    setImageFocalPoint(editingFocalIdx.value, x, y);
  } else {
    setThumbFocalPoint(editingFocalIdx.value, x, y);
  }
}

function openFocalEditor(idx: number) {
  editingFocalIdx.value = idx;
  focalEditMode.value = 'cover';
  focalEditorZoom.value = 1;
  focalEditorPan.value = { x: 0, y: 0 };
  void nextTick(() => {
    document.querySelector('.img-focal-editor')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

async function addImageFromUrl() {
  const url = urlInput.value.trim();
  if (!url) return;
  uploading.value = true;
  try {
    const result = await processAndUploadImage(
      form.value.id || 'temp',
      url,
      form.value.images.length,
    );
    if (form.value.images.length === 0) result.isCover = true;
    form.value.images.push(result);
    urlInput.value = '';
    showUploadZone.value = false;
    $q.notify({ type: 'positive', message: t('admin.imageUploaded'), position: 'top' });
    openFocalEditor(form.value.images.length - 1);
  } catch (e) {
    $q.notify({ type: 'negative', message: t('admin.uploadFailed'), position: 'top' });
    console.error('URL upload failed:', e);
  } finally {
    uploading.value = false;
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  uploading.value = true;
  try {
    let lastIdx = -1;
    for (const file of files) {
      const compressed = await compressImage(file);
      const plantId = form.value.id || 'temp';
      const idx = form.value.images.length;
      const url = await uploadPlantImage(plantId, compressed, `img-${idx}-${Date.now()}.webp`);
      const newImg: PlantImage = { url };
      if (form.value.images.length === 0) newImg.isCover = true;
      form.value.images.push(newImg);
      lastIdx = form.value.images.length - 1;
    }
    showUploadZone.value = false;
    $q.notify({ type: 'positive', message: t('admin.imageUploaded'), position: 'top' });
    if (lastIdx >= 0) openFocalEditor(lastIdx);
  } catch (err) {
    $q.notify({ type: 'negative', message: `${t('admin.uploadFailed')}: ${String(err)}`, position: 'top' });
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

function toggleUploadZone() {
  showUploadZone.value = !showUploadZone.value;
  if (showUploadZone.value) {
    void nextTick(() => {
      document.querySelector('.img-upload-zone')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}

function triggerFileInput() {
  const input = document.querySelector('#imageFileInput') as HTMLInputElement;
  input?.click();
}

async function handleSave() {
  if (!validate()) return;

  // Set stemTips
  if (stemTipsLocal.value.nl || stemTipsLocal.value.en) {
    form.value.stemTips = { ...stemTipsLocal.value };
  } else {
    form.value.stemTips = null;
  }

  // Generate ID if new
  if (!form.value.id) {
    form.value.id = generateId(form.value.species, form.value.variety);
  }

  try {
    if (isNew.value) {
      await createPlant(form.value);
    } else {
      await savePlant(form.value);
    }
    $q.notify({ type: 'positive', message: t('admin.plantSaved') });
    emit('update:modelValue', false);
  } catch (err: unknown) {
    $q.notify({ type: 'negative', message: `${t('admin.failedToSave')}: ${String(err)}` });
  }
}

function handleBack() {
  if (isDirty.value) {
    showDiscard.value = true;
  } else {
    emit('update:modelValue', false);
  }
}

function handleDialogUpdate(val: boolean) {
  if (!val && isDirty.value) {
    showDiscard.value = true;
  } else {
    emit('update:modelValue', val);
  }
}

function confirmDiscard() {
  showDiscard.value = false;
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.edit-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sand);
}

// ── Header ──
.edit-header {
  flex-shrink: 0;
  background: var(--warm-white);
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 20px 0;
  box-shadow: var(--shadow-header);
  z-index: 10;
}

.edit-header__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-header__back {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.15s;
  flex-shrink: 0;
  margin-left: -4px;

  &:hover { background: var(--sand); color: var(--deep-brown); }
  .material-icons-outlined { font-size: 20px; }
}

.type-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .material-icons-outlined { font-size: 15px; }

  &.flower { background: var(--flower-bg); color: var(--flower); }
  &.herb { background: var(--herb-bg); color: var(--herb); }
  &.vegetable { background: var(--veg-bg); color: var(--veg); }
}

.edit-header__info {
  flex: 1;
  min-width: 0;
}

.edit-header__species {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--deep-brown);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-header__variety {
  font-size: 12px;
  color: var(--clay);
  font-style: italic;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ── Tab bar ──
.tab-bar {
  flex-shrink: 0;
  display: flex;
  background: var(--warm-white);
  padding: 0;
  border-bottom: 1.5px solid var(--border-light);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px 7px;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted-light);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
  position: relative;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  letter-spacing: 0.1px;

  &--active {
    color: var(--moss);
    border-bottom-color: var(--moss);
  }
}

.tab__icon .material-icons-outlined {
  font-size: 18px;
  display: block;
}

.tab__badge {
  position: absolute;
  top: 5px;
  right: calc(50% - 18px);
  font-size: 8px;
  font-weight: 700;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  background: var(--moss-pale);
  color: var(--moss);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &--warn { background: var(--clay-pale); color: var(--clay); }
  &--empty { background: var(--overdue-bg); color: var(--overdue); }
  &--error { background: var(--overdue-bg); color: var(--overdue); }
}

// ── Content area ──
.content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 16px 20px 24px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  &--active {
    opacity: 1;
    visibility: visible;
  }
}

// ── Form fields ──
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.field__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted);
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.field__req {
  color: var(--overdue);
  font-size: 14px;
  font-weight: 700;
  line-height: 0.7;
}

.field__opt {
  font-size: 10px;
  font-weight: 400;
  color: var(--muted-light);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  margin-left: 2px;
}

.field__input,
.field__textarea {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--deep-brown);
  background: var(--warm-white);
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  -webkit-appearance: none;

  &:focus { border-color: var(--clay-light); }
  &::placeholder { color: var(--muted-light); font-style: italic; }
}

.field__textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.field__input[type='number'] {
  -moz-appearance: textfield;
  font-variant-numeric: tabular-nums;
  padding: 9px 12px;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
}

.field__error {
  font-size: 11px;
  color: var(--overdue);
  font-weight: 500;
  display: none;
}

.field--invalid {
  .field__error { display: block; }
  .field__label { color: var(--overdue); }
  .field__input,
  .field__textarea,
  .combobox__input { border-color: var(--overdue) !important; background: #FFFAF9; }
}

.field-row {
  display: flex;
  gap: 10px;

  > .field { flex: 1; }
}

// ── Range pair ──
.range-pair {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--warm-white);
  overflow: hidden;
  transition: border-color 0.15s;

  &:focus-within { border-color: var(--clay-light); }

  &__input {
    flex: 1;
    border: none;
    padding: 9px 10px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--deep-brown);
    background: transparent;
    outline: none;
    text-align: center;
    -moz-appearance: textfield;
    font-variant-numeric: tabular-nums;
    min-width: 0;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }

  &__sep {
    font-size: 14px;
    color: var(--muted-light);
    flex-shrink: 0;
    user-select: none;
  }
}

// ── Segment control ──
.segment {
  display: flex;
  gap: 0;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  padding: 3px;
  border: 1.5px solid var(--border);
}

.segment__btn {
  flex: 1;
  padding: 8px 4px;
  border: none;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;

  &--active {
    background: var(--moss);
    color: #fff;
    box-shadow: 0 1px 4px rgba(92, 107, 78, 0.2);
  }

  &:hover:not(.segment__btn--active) { color: var(--deep-brown); }
}

.segment-icon {
  font-size: 13px;
  vertical-align: -2px;
  margin-right: 2px;
  opacity: 0.8;
}

.segment__btn--active .segment-icon { opacity: 1; }

.segment-svg {
  width: 13px;
  height: 13px;
  vertical-align: -2px;
  margin-right: 2px;
  opacity: 0.8;

  &--tuber {
    color: var(--tuber);
  }
}

.segment__btn--active .segment-svg {
  opacity: 1;
  color: inherit;
}

.tuber-note {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  font-style: italic;
  padding: 8px 12px;
  background: var(--tuber-bg);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--tuber);
}

// ── Combobox ──
.combobox {
  position: relative;
}

.combobox__input {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 36px 10px 12px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--deep-brown);
  background: var(--warm-white);
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  -webkit-appearance: none;

  &:focus { border-color: var(--clay-light); }
  &::placeholder { color: var(--muted-light); font-style: italic; }
}

.combobox__icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--muted-light);
  pointer-events: none;
  transition: transform 0.2s;
}

.combobox--open .combobox__icon { transform: translateY(-50%) rotate(180deg); }
.combobox--open .combobox__input { border-color: var(--clay-light); border-radius: var(--radius-sm) var(--radius-sm) 0 0; }

.combobox__dropdown {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 20;
  background: var(--warm-white);
  border: 1.5px solid var(--clay-light);
  border-top: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  max-height: 160px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(53, 43, 34, 0.1);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; margin: 4px 0; }
  &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--clay-light); }
}

.combobox--open .combobox__dropdown { display: block; }

.combobox__option {
  padding: 9px 12px;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--deep-brown);
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: var(--sand); }
  &--active { background: var(--moss-ghost); font-weight: 500; }
}

.combobox__empty {
  padding: 12px;
  text-align: center;
}

.combobox__empty-primary {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--muted);
  display: block;
}

.combobox__empty-hint {
  font-size: 11px;
  color: var(--muted-light);
  font-style: italic;
  display: block;
  margin-top: 2px;
}

// ── Type radio buttons ──
.type-radios {
  display: flex;
  gap: 12px;
}

.type-radio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  outline: none;

  &__circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border: 2px solid transparent;

    .material-icons-outlined { font-size: 17px; }
  }

  &--flower .type-radio__circle { background: var(--flower-bg); color: var(--flower); }
  &--herb .type-radio__circle { background: var(--herb-bg); color: var(--herb); }
  &--veg .type-radio__circle { background: var(--veg-bg); color: var(--veg); }

  &--active.type-radio--flower .type-radio__circle { border-color: var(--flower); box-shadow: 0 2px 8px rgba(196, 133, 138, 0.3); }
  &--active.type-radio--herb .type-radio__circle { border-color: var(--herb); box-shadow: 0 2px 8px rgba(123, 148, 112, 0.3); }
  &--active.type-radio--veg .type-radio__circle { border-color: var(--veg); box-shadow: 0 2px 8px rgba(139, 149, 80, 0.3); }

  &__label {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    transition: color 0.15s;
  }

  &--active .type-radio__label { color: var(--deep-brown); font-weight: 600; }
}

// ── Status chips ──
.status-group {
  display: flex;
  gap: 8px;
}

.status-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  border: 1.5px solid var(--border);
  background: var(--warm-white);
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  outline: none;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &--pending .status-chip__dot { background: var(--clay); }
  &--unverified .status-chip__dot { background: var(--cal-indoor); }
  &--verified .status-chip__dot { background: var(--moss); }

  &--active.status-chip--pending { background: var(--clay-pale); border-color: var(--clay-light); color: var(--deep-brown); }
  &--active.status-chip--unverified { background: rgba(125, 161, 184, 0.12); border-color: rgba(125, 161, 184, 0.4); color: var(--deep-brown); }
  &--active.status-chip--verified { background: var(--moss-pale); border-color: var(--moss-light); color: var(--deep-brown); }
}

// ── Color swatches ──
.color-swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
}

.color-swatch {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover { border-color: var(--clay-light); }
}

.color-swatch__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--deep-brown);
  color: var(--warm-white);
  border: 2px solid var(--warm-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.15s;
  z-index: 2;
  line-height: 1;
  font-family: var(--font-body);
  font-weight: 700;

  &--visible,
  .color-swatch:hover & {
    opacity: 1;
    transform: scale(1);
  }
}

.color-add {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 2px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--muted-light);
  background: transparent;
  transition: all 0.15s;

  &:hover { border-color: var(--clay-light); color: var(--clay); }
  .material-icons-outlined { font-size: 16px; }
}

.color-palette {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--warm-white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  box-shadow: 0 8px 28px rgba(53, 43, 34, 0.14);
  z-index: 30;

  &--open { display: block; animation: paletteIn 0.15s ease-out; }
}

@keyframes paletteIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.color-palette__section { margin-bottom: 8px; &:last-child { margin-bottom: 0; } }
.color-palette__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  color: var(--muted-light);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 5px;
}

.color-palette__row { display: flex; gap: 5px; flex-wrap: wrap; }

.color-palette__swatch {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.12s;

  &:hover { transform: scale(1.15); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
  &--light { border-color: var(--border); }
}

// ── Section divider ──
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%);
  margin: 4px 0 16px;
}

// ── Calendar legend ──
.cal-legend {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cal-legend__item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: var(--muted);
  font-weight: 500;
}

.cal-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;

  &--indoor { background: rgba(125, 161, 184, 0.55); }
  &--cold { background: rgba(160, 165, 160, 0.35); }
  &--outdoor { background: rgba(123, 148, 112, 0.55); }
  &--flowering { background: rgba(196, 133, 138, 0.55); }
}

// ── Planting chips ──
.chip-group { display: flex; flex-wrap: wrap; gap: 6px; }

.chip {
  padding: 7px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  background: var(--warm-white);
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: var(--clay-light); }
  &--on { background: var(--moss-pale); border-color: var(--moss); color: var(--moss); font-weight: 600; }
}

// ── Toggle ──
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child { border-bottom: none; }
}

.toggle-row__label {
  font-size: 13.5px;
  color: var(--deep-brown);
  font-weight: 500;
}

.toggle-row__sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 1px;
}

.toggle {
  width: 44px;
  height: 24px;
  background: var(--border);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  &--on {
    background: var(--moss);

    &::after { transform: translateX(20px); }
  }
}

// ── Care steps ──
.care-intro {
  font-size: 12.5px;
  color: var(--muted);
  margin-bottom: 14px;
  line-height: 1.5;
}

.care-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.care-step {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--warm-white);
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-light);
  transition: all 0.2s;
  position: relative;

  &:hover { border-color: var(--border); }

  &--dragging {
    opacity: 0.4;
  }

  &--over {
    border-color: var(--moss);
    box-shadow: 0 -2px 0 0 var(--moss);
  }

  &__num {
    width: 22px;
    height: 22px;
    background: var(--moss-pale);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--moss);
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__body { flex: 1; min-width: 0; }

  &__action {
    font-size: 13px;
    font-weight: 600;
    color: var(--deep-brown);
    line-height: 1.3;
  }

  &__cond {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
  }

  &__drag {
    color: var(--muted-light);
    cursor: grab;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-top: 1px;

    .material-icons-outlined { font-size: 18px; }
    &:active { cursor: grabbing; }
  }

  &__delete {
    position: absolute;
    top: -7px;
    right: -7px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--deep-brown);
    color: var(--warm-white);
    border: 2px solid var(--sand);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.6);
    transition: all 0.15s;
    z-index: 2;

    .material-icons-outlined { font-size: 12px; }

    &:hover { background: var(--overdue); }
  }

  &:hover .care-step__delete {
    opacity: 1;
    transform: scale(1);
  }
}

.care-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  transition: all 0.15s;
  margin-top: 8px;

  &:hover { border-color: var(--clay-light); color: var(--clay); }
  .material-icons-outlined { font-size: 16px; }
}

// ── Care form ──
.care-form {
  background: var(--warm-white);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 8px;
  animation: careFormIn 0.2s ease-out;

  &__row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--muted);
  }

  &__input {
    border: 1.5px solid var(--border);
    border-radius: 6px;
    padding: 8px 10px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--deep-brown);
    background: var(--sand);
    outline: none;
    width: 100%;
    transition: border-color 0.15s;
    -webkit-appearance: none;

    &:focus { border-color: var(--clay-light); }
    &::placeholder { color: var(--muted-light); font-style: italic; font-size: 12px; }
  }

  &__cond-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--muted);
    margin-bottom: 5px;
  }

  &__cond-chips {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__cond-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: var(--radius-pill);
    border: 1.5px solid var(--border-light);
    background: var(--warm-white);
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;

    .material-icons-outlined { font-size: 13px; }

    &:hover { border-color: var(--border); color: var(--deep-brown); }

    &--active {
      background: var(--moss-pale);
      border-color: var(--moss-light);
      color: var(--moss);
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }

  &__btn {
    flex: 1;
    padding: 9px 14px;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover { opacity: 0.85; }
    &--cancel { background: var(--sand); color: var(--muted); }
    &--save { background: var(--moss); color: #fff; }
  }
}

@keyframes careFormIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Save bar ──
.save-bar {
  flex-shrink: 0;
  padding: 10px 20px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  background: var(--sand);
  border-top: 1px solid var(--border-light);
}

.save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--moss);
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(92, 107, 78, 0.2);

  &:hover:not(:disabled) { background: var(--moss-light); }
  .material-icons-outlined { font-size: 18px; }

  &:disabled {
    background: var(--border);
    color: var(--muted-light);
    box-shadow: none;
    cursor: not-allowed;
  }
}

@keyframes headShake {
  0% { transform: translateX(0); }
  15% { transform: translateX(-4px); }
  30% { transform: translateX(3px); }
  45% { transform: translateX(-2px); }
  60% { transform: translateX(1px); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}

.save-btn--shake { animation: headShake 0.5s ease; }

// ── Discard dialog ──
.discard-dialog {
  background: var(--warm-white);
  border-radius: var(--radius-card);
  padding: 24px;
  min-width: 280px;
  max-width: 300px;
  text-align: center;

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--clay-pale);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;

    .material-icons-outlined { font-size: 22px; color: var(--clay); }
  }

  &__title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--deep-brown);
    margin-bottom: 6px;
  }

  &__text {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 20px;
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  &__btn {
    padding: 11px 16px;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: 13.5px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    text-align: center;

    &:hover { opacity: 0.85; }
    &--cancel { background: var(--sand); color: var(--muted); }
    &--confirm { background: var(--clay); color: #fff; }
  }
}

// ══════════════════════════════════════
// IMAGE TAB
// ══════════════════════════════════════

.img-cover-section { margin-bottom: 16px; }

.img-cover-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--border-light);
  cursor: crosshair;
  touch-action: none;

  img {
    width: 100%; height: 100%; object-fit: cover; pointer-events: none;
    transform-origin: center center;
    transition: transform 0.1s ease-out;
  }

  &--zoomed { cursor: grab; }
  &--panning { cursor: grabbing; }

  &--empty {
    cursor: pointer;
  }
}

.img-focal-point {
  position: absolute;
  width: 28px; height: 28px;
  border: 2.5px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  transition: left 0.15s, top 0.15s;
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
  }

  &--small {
    width: 20px; height: 20px;
    border-width: 2px;
    &::after { inset: 2px; }
  }

  &--card {
    border-color: var(--clay);
    &::after { background: rgba(194, 133, 78, 0.4); }
  }
}

.img-cover-badge {
  position: absolute; top: 8px; left: 8px;
  background: rgba(53, 43, 34, 0.65);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  display: flex; align-items: center; gap: 4px;

  .material-icons-outlined { font-size: 12px; }
}

.img-focal-hint {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  background: rgba(53, 43, 34, 0.6);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.85);
  font-size: 10.5px; font-weight: 500;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;

  .img-cover-preview:hover &,
  .img-focal-editor__image:hover & { opacity: 1; }
}

.img-zoom-pill {
  position: absolute; top: 8px; right: 8px;
  background: rgba(53, 43, 34, 0.7);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  pointer-events: none;
  z-index: 5;

  &--small {
    font-size: 9px;
    padding: 2px 6px;
  }
}

// Card preview section
.img-card-section {
  margin-bottom: 16px;
}

.img-card-row {
  display: flex; gap: 14px; align-items: flex-start;
}

.img-card-thumb {
  position: relative;
  width: 110px; height: 140px;
  flex-shrink: 0;
  border-radius: 16px 12px 16px 12px;
  overflow: hidden;
  background: var(--sand);
  cursor: crosshair;
  touch-action: none;

  img {
    width: 100%; height: 100%; object-fit: cover; object-position: top; pointer-events: none;
    transform-origin: center center;
    transition: transform 0.1s ease-out;
  }

  &--zoomed { cursor: grab; }
  &--panning { cursor: grabbing; }
}

.img-card-info {
  flex: 1; min-width: 0;
  font-size: 11px; line-height: 1.55; color: var(--muted);
  padding-top: 4px;

  p { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
  strong { color: var(--ink-soft); font-weight: 600; }
}

// Image count
.img-count {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}

.img-count__text {
  font-size: 11px; color: var(--muted); font-weight: 500;
  strong { color: var(--deep-brown); font-weight: 600; }
}

// Gallery grid
.img-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.img-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;

  &:hover { border-color: var(--clay-light); }
  &--cover {
    border-color: var(--moss);
    &::after {
      content: '';
      position: absolute; inset: 0;
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px rgba(92, 107, 78, 0.3);
    }
  }
  &--card:not(&--cover) {
    border-color: var(--clay-light);
  }

  img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
}

.img-item__actions {
  position: absolute; top: 0; left: 0; right: 0;
  padding: 4px;
  display: flex; justify-content: space-between;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 3;

  .img-item:hover & { opacity: 1; }
  .img-item--cover &, .img-item--card & { opacity: 1; }
}

.img-item__actions-left {
  display: flex; gap: 3px;
}

.img-item__tags {
  position: absolute; bottom: 4px; left: 4px;
  display: flex; gap: 3px;
  z-index: 3;
}

.img-item__btn {
  width: 24px; height: 24px;
  border: none; border-radius: 50%;
  background: rgba(53, 43, 34, 0.6);
  backdrop-filter: blur(4px);
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;

  &:hover { background: rgba(53, 43, 34, 0.85); }
  .material-icons-outlined { font-size: 14px; }
  &--star.active { color: #F5C842; }
  &--crop.active { color: #7DD3FC; }
  &--delete:hover { background: rgba(194, 91, 78, 0.85); }
}

.img-item__cover-tag {
  background: var(--moss); color: #fff;
  font-size: 8.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px;
  padding: 2px 6px;
  border-radius: 4px;
}

.img-item__card-tag {
  background: var(--clay); color: #fff;
  font-size: 8.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px;
  padding: 2px 6px;
  border-radius: 4px;
}

.img-add {
  aspect-ratio: 1;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  cursor: pointer;
  color: var(--muted-light);
  background: transparent;
  font-family: var(--font-body);

  &:hover {
    border-color: var(--clay-light);
    color: var(--clay);
    background: rgba(243, 232, 223, 0.3);
  }

  .material-icons-outlined { font-size: 22px; }
  span:last-child { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
}

// Focal editor
.img-focal-editor {
  background: var(--warm-white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-top: 14px;
  animation: imgSlideIn 0.2s ease-out;
}

@keyframes imgSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.img-focal-editor__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}

.img-focal-editor__title {
  font-family: var(--font-display);
  font-size: 13px; font-weight: 600;
  color: var(--deep-brown);
}

.img-focal-editor__close {
  width: 24px; height: 24px;
  border: none; background: transparent;
  border-radius: 50%; cursor: pointer;
  color: var(--muted);
  display: flex; align-items: center; justify-content: center;

  .material-icons-outlined { font-size: 16px; }
}

.img-focal-editor__mode-toggle {
  display: flex; gap: 2px;
  background: var(--sand);
  border-radius: var(--radius-pill);
  padding: 2px;
}

.img-focal-editor__mode-btn {
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  font-family: var(--font-body);
  font-size: 10.5px; font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;

  &--active {
    background: var(--warm-white);
    color: var(--deep-brown);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
}

.img-focal-editor__image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  transition: aspect-ratio 0.25s ease, max-width 0.25s ease;

  img {
    width: 100%; height: 100%; object-fit: cover; pointer-events: none;
    transform-origin: center center;
    transition: transform 0.1s ease-out;
  }

  &--card-mode {
    aspect-ratio: 110 / 140;
    max-width: 220px;
    margin: 0 auto;
  }

  &--zoomed { cursor: grab; }
  &--panning { cursor: grabbing; }
}

// Upload zone
.img-upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  text-align: center;
  margin-top: 14px;
  background: var(--warm-white);
}

.img-upload-zone__icon {
  display: flex; justify-content: center;
  margin-bottom: 8px;
  color: var(--muted-light);
  .material-icons-outlined { font-size: 32px; }
}

.img-upload-zone__text {
  font-size: 13px; font-weight: 500; color: var(--muted);
  margin-bottom: 4px;
}

.img-upload-zone__hint {
  font-size: 11px; color: var(--muted-light);
  margin-bottom: 12px;
}

.img-upload-zone__file-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--warm-white);
  font-family: var(--font-body);
  font-size: 12px; font-weight: 600;
  color: var(--deep-brown);
  cursor: pointer;
  margin-bottom: 12px;

  .material-icons-outlined { font-size: 16px; }
  &:hover { border-color: var(--clay-light); }
}

.img-upload-zone__or {
  font-size: 10px; color: var(--muted-light);
  text-transform: uppercase; letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 10px;
}

.img-upload-zone__url-row {
  display: flex; gap: 6px;
}

.img-upload-zone__url-input {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--deep-brown);
  background: var(--warm-white);
  outline: none;

  &:focus { border-color: var(--clay-light); }
  &::placeholder { color: var(--muted-light); font-style: italic; }
}

.img-upload-zone__url-btn {
  padding: 8px 14px;
  border: none;
  background: var(--moss);
  color: #fff;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 12px; font-weight: 600;
  cursor: pointer;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// Empty state
.img-empty-state {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  color: var(--muted-light);
  aspect-ratio: 16 / 10;

  .material-icons-outlined { font-size: 40px; opacity: 0.5; }
  span:last-child { font-size: 12px; font-weight: 500; }
}
</style>
