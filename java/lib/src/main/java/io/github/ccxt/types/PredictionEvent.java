package io.github.ccxt.types;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Native dedicated prediction-market type. Hierarchy: Event -> Market -> Outcome.
// `markets` holds the grouped market rows (each carrying its outcomes list),
// parsed into PredictionMarket. Mirrors the `PredictionEvent`
// interface in ts/src/base/types.ts and the Go/C# structs.
public final class PredictionEvent {
    public String id;      // raw exchange event id
    public String eventId; // unified handle "US_ELECTION_2024"
    public String title;
    public String description;
    public String slug;
    public String category;
    public List<String> tags;
    public List<PredictionMarket> markets; // grouped market rows (each with its outcomes list)
    public Boolean mutuallyExclusive;     // exactly one market in the event resolves YES
    public Boolean active;
    public Boolean resolved;
    public Double volume;
    public Double liquidity;
    public Long created;
    public String createdDatetime;
    public Long end;
    public String endDatetime;
    public String image;
    public String url;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionEvent(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.id = TypeHelper.safeString(data, "id");
        this.eventId = TypeHelper.safeString(data, "event");
        this.title = TypeHelper.safeString(data, "title");
        this.description = TypeHelper.safeString(data, "description");
        this.slug = TypeHelper.safeString(data, "slug");
        this.category = TypeHelper.safeString(data, "category");
        Object tagsRaw = TypeHelper.safeValue(data, "tags");
        if (tagsRaw instanceof List<?> tagsList) {
            this.tags = ((List<Object>) tagsList).stream().filter(t -> t instanceof String).map(t -> (String) t).collect(Collectors.toList());
        }
        Object marketsRaw = TypeHelper.safeValue(data, "markets");
        if (marketsRaw instanceof List<?> marketsList) {
            this.markets = ((List<Object>) marketsList).stream().map(PredictionMarket::new).collect(Collectors.toList());
        }
        this.mutuallyExclusive = TypeHelper.safeBool(data, "mutuallyExclusive");
        this.active = TypeHelper.safeBool(data, "active");
        this.resolved = TypeHelper.safeBool(data, "resolved");
        this.volume = TypeHelper.safeFloat(data, "volume");
        this.liquidity = TypeHelper.safeFloat(data, "liquidity");
        this.created = TypeHelper.safeInteger(data, "created");
        this.createdDatetime = TypeHelper.safeString(data, "createdDatetime");
        this.end = TypeHelper.safeInteger(data, "end");
        this.endDatetime = TypeHelper.safeString(data, "endDatetime");
        this.image = TypeHelper.safeString(data, "image");
        this.url = TypeHelper.safeString(data, "url");
        this.info = TypeHelper.getInfo(data);
    }
}
