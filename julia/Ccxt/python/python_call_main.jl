# Run selected Python tests using a subprocess call that ensures the local
# repo checkout is used instead of any globally-installed ccxt from site-packages.
# The site-packages guard in python/ccxt/test/tests_helpers.py:84-85 aborts if
# it detects ccxt loaded from site-packages. We prevent that by prepending the
# repo root to PYTHONPATH so that `import ccxt` resolves to /ccxt/python/ccxt/
# before any site-packages installation, while still allowing legitimate
# dependencies (cryptography, aiohttp, etc.) to load from site-packages.
const PYTHON_EXE = "/usr/bin/python3"
const PYTHON_REPO = "/ccxt"

function run_py(args::Vector{String})
    # Prepend the repo root and python/ dir to PYTHONPATH so the local
    # ccxt package is found first. We do NOT use -s (which would strip
    # all site-packages and break legitimate deps like cryptography).
    # The PYTHONPATH ordering ensures `import ccxt` hits /ccxt/python/ccxt/
    # before /usr/lib/python3/dist-packages/ccxt.
    sep = Sys.iswindows() ? ";" : ":"
    env_pythonpath = PYTHON_REPO * sep * PYTHON_REPO * "/python" * sep * get(ENV, "PYTHONPATH", "")
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