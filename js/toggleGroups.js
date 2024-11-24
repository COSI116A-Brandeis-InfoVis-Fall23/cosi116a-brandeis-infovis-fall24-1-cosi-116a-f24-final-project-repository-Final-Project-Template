document.getElementById("btn-group1").addEventListener("click", function () {
    toggleGroups("group1");
  });
  
document.getElementById("btn-group2").addEventListener("click", function () {
    toggleGroups("group2");
  });
document.getElementById("btn-group3").addEventListener("click", function () {
    toggleGroups("group3");
  });
  
  function toggleGroups(activeGroupClass) {
    // Get all groups
    const groups = document.querySelectorAll(".group");
    groups.forEach(group => {
      if (group.classList.contains(activeGroupClass)) {
        group.classList.remove("hidden");
      } else {
        group.classList.add("hidden");
      }
    });
  }
  