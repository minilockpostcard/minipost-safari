commandWasIssued = (event) ->
  if event.command is "minipostWasLaunched"
    {activeTab} = event.target.browserWindow
    if activeTab.url?.match("/write")
      activeTab.url = location.toString().replace("safari.global", "unlock")
    else
      activeTab.url = location.toString().replace("safari.global", "write")

safari.application.addEventListener "command", commandWasIssued, false
