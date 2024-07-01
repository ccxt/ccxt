import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
assert os.path.exists(os.path.join(ROOT_DIR, "starkware"))


def generate_python_dependencies(dependencies_path, start_time):
    """
    Creates a CMake file with the loaded python module.
    """
    files = [
        x.__file__
        for x in sys.modules.values()
        if hasattr(x, "__file__") and x.__file__ is not None
    ]

    res = "SET (DEPENDENCIES\n"
    for filename in sorted(files):
        if filename.startswith(ROOT_DIR):
            res += filename + "\n"
    res += ")\n"

    with open(dependencies_path, "w") as dependencies_file:
        dependencies_file.write(res)

    # Change the modification time of the file to make sure it is older than the generated files.
    os.utime(dependencies_path, (start_time, start_time))


def add_argparse_argument(parser):
    """
    Adds the --python_dependencies flag to the given parser.
    Use process_args at the end of the program to generate the dependency file.
    """
    parser.add_argument(
        "--python_dependencies",
        type=str,
        help="Output the starkware python modules this file depends on as a CMake file.",
    )


def process_args(args, start_time):
    """
    Generates the dependency file according to the --python_dependencies flag.
    start_time is the time at the beginning of the program (time.time()).
    """
    if args.python_dependencies is not None:
        generate_python_dependencies(args.python_dependencies, start_time)
