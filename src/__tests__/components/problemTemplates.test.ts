import { getProblemContext, getProblemTemplate } from "@/components/playground/ProblemTemplates";

describe("problem templates", () => {
  it("finds the requested problem context", () => {
    const context = getProblemContext("two-sum", "arrays");

    expect(context).not.toBeNull();
    expect(context?.topic.slug).toBe("arrays");
    expect(context?.kind).toBe("array");
  });

  it("builds a runnable array template", () => {
    const context = getProblemContext("two-sum", "arrays");
    expect(context).not.toBeNull();

    const template = getProblemTemplate(context!, "python");
    expect(template).toContain("Problem: Two Sum");
    expect(template).toContain("def twoSum(nums: list[int], target: int) -> list[int]:");
    expect(template).toContain("nums = [2, 7, 11, 15]");
  });

  it("builds linked list and graph helpers for matching problem families", () => {
    const linkedListContext = getProblemContext("reverse-linked-list", "linked-lists");
    const graphContext = getProblemContext("number-of-islands", "graphs");

    expect(getProblemTemplate(linkedListContext!, "javascript")).toContain("class ListNode");
    expect(getProblemTemplate(graphContext!, "javascript")).toContain("const adjacencyList");
  });
});
