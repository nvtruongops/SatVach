import { describe, it, expect, beforeEach } from "vitest";
import {
  searchStore,
  setQuery,
  setCategory,
  setRadius,
  setCenter,
  setBbox,
  setIsSearching,
  setSearchStore,
} from "../../src/stores/searchStore";

describe("searchStore", () => {
  beforeEach(() => {
    // Reset store state
    setSearchStore({
      query: "",
      category: "all",
      radius: 5000,
      center: null,
      bbox: null,
      isSearching: false,
    });
  });

  it("should update query", () => {
    setQuery("coffee");
    expect(searchStore.query).toBe("coffee");
  });

  it("should update category", () => {
    setCategory("food");
    expect(searchStore.category).toBe("food");
  });

  it("should update radius", () => {
    setRadius(1000);
    expect(searchStore.radius).toBe(1000);
  });

  it("should update center", () => {
    setCenter({ lat: 10, lng: 100 });
    expect(searchStore.center).toEqual({ lat: 10, lng: 100 });
  });

  it("should update bbox", () => {
    setBbox([1, 2, 3, 4]);
    expect(searchStore.bbox).toEqual([1, 2, 3, 4]);
  });

  it("should update isSearching", () => {
    setIsSearching(true);
    expect(searchStore.isSearching).toBe(true);
  });
});
