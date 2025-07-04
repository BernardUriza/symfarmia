import { renderHook, act } from "@testing-library/react";
import { AppModeProvider, useAppMode } from "../app/providers/AppModeProvider";

const wrapper = ({ children }) => <AppModeProvider>{children}</AppModeProvider>;

describe("AppModeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.location;
    window.location = new URL("http://localhost/");
  });

  it("defaults to live mode", () => {
    const { result } = renderHook(() => useAppMode(), { wrapper });
    expect(result.current.appMode).toBe("live");
  });

  it.skip("toggles and persists mode", async () => {
    const { result } = renderHook(() => useAppMode(), { wrapper });
    await act(async () => {});
    const before = window.localStorage.getItem("appMode");
    act(() => {
      result.current.toggleMode();
    });
    const after = window.localStorage.getItem("appMode");
    expect(after).not.toBe(before);
  });
});
