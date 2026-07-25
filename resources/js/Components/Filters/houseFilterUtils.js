export const emptyValue = (value) =>
    value === "" || value === null || value === undefined;

export const getCityFilter = (filters = {}) => filters?.city_filter ?? null;

export const getRangeFilters = (filters = {}) => filters?.range_filters ?? [];

export const getMultiFilters = (filters = {}) => filters?.multi_filters ?? [];

export const getFilterKeys = (filters = {}) => {
    const cityFilter = getCityFilter(filters);
    const keys = [];

    if (cityFilter) {
        keys.push(cityFilter.key);
    }

    getRangeFilters(filters).forEach((filter) => {
        keys.push(filter.key_min, filter.key_max);
    });

    getMultiFilters(filters).forEach((filter) => {
        keys.push(filter.key);
    });

    return keys.filter(Boolean);
};

export const toArray = (value) => {
    if (Array.isArray(value)) {
        return value.filter((item) => !emptyValue(item)).map(String);
    }

    return emptyValue(value) ? [] : [String(value)];
};

export const getBoundValue = (filter, edge) => filter?.bounds?.[edge] ?? "";

const formatLabel = (template, value) => {
    const replacement = String(value);

    return String(template ?? replacement)
        .replace(/:value/g, replacement)
        .replace(/:label/g, replacement);
};

const translatedTemplate = (key, fallback, t) => {
    if (!key || typeof t !== "function") {
        return fallback;
    }

    const translated = t(key);

    return translated === key ? fallback : translated;
};

export const getDefaultFilterForm = (filters) => {
    const form = {};
    const cityFilter = getCityFilter(filters);

    if (cityFilter) {
        form[cityFilter.key] = "";
    }

    getRangeFilters(filters).forEach((filter) => {
        form[filter.key_min] = getBoundValue(filter, "min");
        form[filter.key_max] = getBoundValue(filter, "max");
    });

    getMultiFilters(filters).forEach((filter) => {
        form[filter.key] = [];
    });

    return form;
};

export const getFilterFormFromQuery = (query = {}, filters = {}) => {
    const defaults = getDefaultFilterForm(filters);
    const form = { ...defaults };
    const cityFilter = getCityFilter(filters);

    if (cityFilter) {
        form[cityFilter.key] = query[cityFilter.key] ?? defaults[cityFilter.key];
    }

    getRangeFilters(filters).forEach((filter) => {
        form[filter.key_min] = query[filter.key_min] ?? defaults[filter.key_min];
        form[filter.key_max] = query[filter.key_max] ?? defaults[filter.key_max];
    });

    getMultiFilters(filters).forEach((filter) => {
        form[filter.key] = toArray(query[filter.key]);
    });

    return form;
};

export const sameFilterValue = (value, defaultValue) => {
    const numericValue = Number(value);
    const numericDefault = Number(defaultValue);

    if (
        !emptyValue(value) &&
        !emptyValue(defaultValue) &&
        Number.isFinite(numericValue) &&
        Number.isFinite(numericDefault)
    ) {
        return numericValue === numericDefault;
    }

    return String(value) === String(defaultValue ?? "");
};

export const changedRangeValue = (value, defaultValue) =>
    !emptyValue(value) && !sameFilterValue(value, defaultValue);

export const buildCleanedFilters = (form, filters) => {
    const cleaned = {};
    const cityFilter = getCityFilter(filters);

    if (cityFilter && !emptyValue(form[cityFilter.key])) {
        cleaned[cityFilter.key] = form[cityFilter.key];
    }

    getRangeFilters(filters).forEach((filter) => {
        const minDefault = getBoundValue(filter, "min");
        const maxDefault = getBoundValue(filter, "max");

        if (changedRangeValue(form[filter.key_min], minDefault)) {
            cleaned[filter.key_min] = form[filter.key_min];
        }

        if (changedRangeValue(form[filter.key_max], maxDefault)) {
            cleaned[filter.key_max] = form[filter.key_max];
        }
    });

    getMultiFilters(filters).forEach((filter) => {
        const selectedValues = toArray(form[filter.key]);

        if (selectedValues.length > 0) {
            cleaned[filter.key] = selectedValues;
        }
    });

    return cleaned;
};

export const getActiveFilters = (query = {}, filters = {}, t) => {
    const activeFilters = [];
    const cityFilter = getCityFilter(filters);

    if (cityFilter && !emptyValue(query[cityFilter.key])) {
        activeFilters.push({
            id: `${cityFilter.key}:${query[cityFilter.key]}`,
            key: cityFilter.key,
            label: formatLabel(
                translatedTemplate(cityFilter.active_label_key, cityFilter.active_label, t),
                query[cityFilter.key],
            ),
        });
    }

    getRangeFilters(filters).forEach((filter) => {
        const minValue = query[filter.key_min];
        const minDefault = getBoundValue(filter, "min");
        const maxValue = query[filter.key_max];
        const maxDefault = getBoundValue(filter, "max");

        if (changedRangeValue(minValue, minDefault)) {
            activeFilters.push({
                id: `${filter.key_min}:${minValue}`,
                key: filter.key_min,
                label: formatLabel(
                    translatedTemplate(filter.active_min_label_key, filter.active_min_label, t),
                    minValue,
                ),
            });
        }

        if (changedRangeValue(maxValue, maxDefault)) {
            activeFilters.push({
                id: `${filter.key_max}:${maxValue}`,
                key: filter.key_max,
                label: formatLabel(
                    translatedTemplate(filter.active_max_label_key, filter.active_max_label, t),
                    maxValue,
                ),
            });
        }
    });

    getMultiFilters(filters).forEach((filter) => {
        const options = filter.options ?? [];

        toArray(query[filter.key]).forEach((value) => {
            const option = options.find((item) => item.value === value);
            const label = option?.label ?? value;

            activeFilters.push({
                id: `${filter.key}:${value}`,
                key: filter.key,
                value,
                label: formatLabel(
                    translatedTemplate(filter.active_label_key, filter.active_label, t),
                    label,
                ),
            });
        });
    });

    return activeFilters;
};

export const cleanQuery = (query) =>
    Object.fromEntries(
        Object.entries(query).filter(([, value]) => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }

            return !emptyValue(value);
        }),
    );

export const getNonFilterQuery = (query = {}, filters = {}) => {
    const filterKeys = new Set(getFilterKeys(filters));

    return cleanQuery(
        Object.fromEntries(
            Object.entries(query).filter(
                ([key]) => key !== "page" && !filterKeys.has(key),
            ),
        ),
    );
};

export const removeFilterFromQuery = (query, filter) => {
    const nextQuery = { ...query };

    if (!emptyValue(filter.value)) {
        const nextValues = toArray(nextQuery[filter.key]).filter(
            (value) => value !== String(filter.value),
        );

        if (nextValues.length > 0) {
            nextQuery[filter.key] = nextValues;
        } else {
            delete nextQuery[filter.key];
        }
    } else {
        delete nextQuery[filter.key];
    }

    return cleanQuery(nextQuery);
};
