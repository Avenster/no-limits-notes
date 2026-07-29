const core = require('@blocknote/core');
if (core.defaultBlockSpecs && core.defaultBlockSpecs.codeBlock) {
    console.log(core.defaultBlockSpecs.codeBlock.config.propSchema.language.values);
} else {
    console.log("Not found");
}
