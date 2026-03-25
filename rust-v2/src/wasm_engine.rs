use wasmer::{Instance, Module, Store, imports, Value, TypedFunction};
use anyhow::{Result, Context};

pub struct WasmEngine {
    store: Store,
}

impl WasmEngine {
    pub fn new() -> Self {
        Self {
            store: Store::default(),
        }
    }

    pub fn run_exploit(&mut self, wasm_bytes: &[u8]) -> Result<i32> {
        let module = Module::new(&self.store, wasm_bytes).context("Failed to compile Wasm module")?;
        let import_object = imports! {};
        let instance = Instance::new(&mut self.store, &module, &import_object).context("Failed to instantiate Wasm module")?;

        let run_func: TypedFunction<(), i32> = instance.exports.get_typed_function(&self.store, "rootspace_run")
            .context("Wasm module must export 'rootspace_run() -> i32'")?;

        let result = run_func.call(&mut self.store).context("Error during Wasm execution")?;
        Ok(result)
    }
}
