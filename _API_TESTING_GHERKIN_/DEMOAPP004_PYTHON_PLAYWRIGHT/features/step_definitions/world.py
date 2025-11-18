"""pytest-bdd hooks to keep Screenplay state aligned across scenarios."""

from pytest_bdd import hooks


@hooks.before_scenario
def before_scenario(request, feature, scenario):
    actor = request.getfixturevalue("actor")
    actor.forget()
    request.getfixturevalue("scenario_context").clear()


@hooks.after_scenario
def after_scenario(request, feature, scenario):
    actor = request.getfixturevalue("actor")
    actor.forget()
