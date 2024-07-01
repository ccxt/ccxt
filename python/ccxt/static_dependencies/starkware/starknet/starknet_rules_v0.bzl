load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_binary")

def starknet_contract_v0(
        name,
        compiled_program_name,
        cairo_compile_exe = "//src/starkware/starknet/compiler:starknet_compile_exe",
        **kwargs):
    cairo_binary(
        name = name,
        abi = "%s_abi.json" % name,
        compiled_program_name = compiled_program_name,
        cairo_compile_exe = cairo_compile_exe,
        **kwargs
    )

def starknet_contract_v0_for_testing(
        name,
        main,
        srcs,
        **kwargs):
    new_main = main[:-6] + "_for_testing.cairo"
    native.genrule(
        name = "generate_" + name,
        srcs = [main],
        outs = [new_main],
        tools = ["//src/starkware/starknet:make_contract_for_testing"],
        cmd = "$(execpath //src/starkware/starknet:make_contract_for_testing) " +
              "--input_path $(execpath %s) " % main +
              "--output_path $(execpath %s)" % new_main,
    )
    starknet_contract_v0(
        name = name,
        main = new_main,
        srcs = srcs + [new_main],
        **kwargs
    )
