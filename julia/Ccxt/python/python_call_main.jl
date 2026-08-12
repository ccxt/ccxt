# Run selected Python tests using a subprocess call that ensures the local
# repo checkout is used instead of any globally-installed ccxt from site-packages.
# The site-packages guard in python/ccxt/test/tests_helpers.py:84-85 aborts if
# it detects ccxt loaded from site-packages. We prevent that by prepending the
# repo root to PYTHONPATH so that `import ccxt` resolves to the local
# python/ccxt/ before any site-packages installation, while still allowing
# legitimate dependencies (cryptography, aiohttp, etc.) to load from site-packages.
#
# Both the interpreter and the repo root are resolved portably:
#  * the interpreter via `Sys.which("python3")` (so it uses whatever python3 the
#    contributor's PATH provides, instead of a hardcoded absolute path);
#  * the repo root by walking up from this file's directory
#    (`julia/Ccxt/python/`) to the ccxt repository root (the directory that
#    contains `package.json`), instead of assuming it lives at `/ccxt`.

# Locate the repo root by searching upward for the directory that owns
# `package.json`. `@__DIR__` is the directory of this file, which is stable
# regardless of the current working directory.
function _repo_root()
    dir = abspath(@__DIR__)
    while dir != dirname(dir)
        isfile(joinpath(dir, "package.json")) && return dir
        dir = dirname(dir)
    end
    # Fall back to the parent of `julia/Ccxt` if we somehow reached the FS root.
    return abspath(@__DIR__, "..", "..")
end

const PYTHON_REPO = _repo_root()
const PYTHON_EXE = something(Sys.which("python3"), "python3")

function run_py(args::Vector{String})
    # Prepend the repo root and python/ dir to PYTHONPATH so the local
    # ccxt package is found first. We do NOT use -s (which would strip
    # all site-packages and break legitimate deps like cryptography).
    # The PYTHONPATH ordering ensures `import ccxt` hits the local
    # python/ccxt/ before any site-packages installation.
    sep = Sys.iswindows() ? ";" : ":"
    existing = get(ENV, "PYTHONPATH", "")
    env_pythonpath = join(filter(!isempty, [PYTHON_REPO, joinpath(PYTHON_REPO, "python"), existing]), sep)
    shell_cmd = `$PYTHON_EXE $args`
    # Start from the existing environment (preserves PATH, HOME, user
    # site-packages discovery, etc.) and only override PYTHONPATH.
    env_dict = copy(ENV)
    env_dict["PYTHONPATH"] = env_pythonpath

    out = read(setenv(shell_cmd, env_dict), String)
    return out
end
if abspath(PROGRAM_FILE) == @__FILE__
    println(run_py(ARGS))
end
